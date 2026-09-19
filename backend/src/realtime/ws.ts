import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import type { AppConfig } from '../config.js';
import { hashToken } from '../security/tokens.js';
import type { VeltrixStore } from '../store/types.js';
import type { RealtimeEventType, RealtimePublisher } from './types.js';

type AuthMessage = { type: 'authenticate'; token: string };

export class RealtimeHub implements RealtimePublisher {
  private readonly wss = new WebSocketServer({ noServer: true });
  private readonly clientsByUser = new Map<string, Set<WebSocket>>();

  constructor(
    private readonly store: VeltrixStore,
    private readonly config: AppConfig,
  ) {}

  attach(server: Server): void {
    server.on('upgrade', (request, socket, head) => {
      let pathname = '';
      try {
        pathname = new URL(request.url || '/', 'http://localhost').pathname;
      } catch {
        socket.destroy();
        return;
      }
      if (pathname !== '/ws') {
        socket.destroy();
        return;
      }
      this.wss.handleUpgrade(request, socket, head, client => {
        this.wss.emit('connection', client, request);
      });
    });

    this.wss.on('connection', socket => {
      let userId: string | null = null;
      let authenticated = false;
      const authTimeout = setTimeout(() => {
        if (!authenticated) socket.close(4401, 'Authentication required');
      }, 5_000);

      socket.once('message', async raw => {
        try {
          const message = JSON.parse(raw.toString()) as Partial<AuthMessage>;
          if (message.type !== 'authenticate' || typeof message.token !== 'string') {
            this.fail(socket, 'SESSION_INVALID', 'Valid client session required');
            return;
          }
          const session = await this.store.getClientSessionByHash(hashToken(message.token, this.config.tokenPepper));
          const now = new Date();
          if (!session || session.revokedAt || session.expiresAt <= now) {
            this.fail(socket, 'SESSION_INVALID', 'Client session expired or revoked');
            return;
          }

          authenticated = true;
          clearTimeout(authTimeout);
          userId = session.userId;
          const group = this.clientsByUser.get(userId) ?? new Set<WebSocket>();
          group.add(socket);
          this.clientsByUser.set(userId, group);
          socket.send(JSON.stringify({ type: 'authenticated', payload: { userId } }));
        } catch {
          this.fail(socket, 'SESSION_INVALID', 'Valid client session required');
        }
      });

      socket.on('close', () => {
        clearTimeout(authTimeout);
        if (!userId) return;
        const group = this.clientsByUser.get(userId);
        if (!group) return;
        group.delete(socket);
        if (!group.size) this.clientsByUser.delete(userId);
      });
    });
  }

  publish(userId: string, type: RealtimeEventType, payload: Record<string, unknown>): void {
    const message = JSON.stringify({ type, payload });
    const clients = this.clientsByUser.get(userId);
    if (!clients) return;
    for (const socket of clients) {
      if (socket.readyState === WebSocket.OPEN) socket.send(message);
    }
  }

  private fail(socket: WebSocket, code: string, message: string): void {
    socket.send(JSON.stringify({ type: 'error', code, message }), () => socket.close(4401, code));
  }
}
