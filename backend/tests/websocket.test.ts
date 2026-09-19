import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import WebSocket from 'ws';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { RealtimeHub } from '../src/realtime/ws.js';
import { signClientHandoff } from '../src/security/handoff.js';
import { hashToken } from '../src/security/tokens.js';
import { MemoryStore } from '../src/store/memory.js';

const config = loadConfig({
  NODE_ENV: 'test', PORT: '3000', CORS_ORIGIN: 'https://gxcracks.github.io',
  SESSION_SECRET: 'session-secret-for-tests-123456', TOKEN_PEPPER: 'token-pepper-for-tests-12345678',
  CLIENT_HANDOFF_SECRET: 'handoff-secret-for-tests-1234567890', COOKIE_SECURE: 'false'
});

const servers: Server[] = [];
afterEach(async () => {
  for (const server of servers.splice(0)) {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

async function startRealtime() {
  const store = new MemoryStore();
  const hub = new RealtimeHub(store, config);
  const app = createApp({ config, store, realtime: hub });
  const server = createServer(app);
  hub.attach(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('missing server address');
  return { store, hub, app, server, port: address.port };
}

async function createClientSession(app: ReturnType<typeof createApp>, username = 'WsPlayer') {
  const ticket = signClientHandoff({
    veltrixUserId: `vel-${username}`,
    minecraftUuid: 'fedcba98-7654-3210-fedc-ba9876543210',
    minecraftUsername: username,
    expiresAt: Date.now() + 60_000,
  }, config.clientHandoffSecret);
  return (await request(app).post('/api/client/session').send({ ticket }).expect(201)).body.token as string;
}

function nextJson(socket: WebSocket): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.once('message', data => {
      try { resolve(JSON.parse(data.toString())); } catch (error) { reject(error); }
    });
    socket.once('error', reject);
  });
}

describe('VELTRIX realtime WebSocket', () => {
  it('authenticates a client session and publishes user-scoped events', async () => {
    const { store, hub, app, port } = await startRealtime();
    const token = await createClientSession(app);
    const session = await store.getClientSessionByHash(hashToken(token, config.tokenPepper));
    if (!session) throw new Error('missing client session');

    const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await once(socket, 'open');
    socket.send(JSON.stringify({ type: 'authenticate', token }));
    expect(await nextJson(socket)).toMatchObject({ type: 'authenticated' });

    const eventPromise = nextJson(socket);
    hub.publish(session.userId, 'cosmetic_equipped', { cosmeticId: 'veltrix_dragon' });
    expect(await eventPromise).toEqual({ type: 'cosmetic_equipped', payload: { cosmeticId: 'veltrix_dragon' } });
    socket.close();
  });

  it('rejects an invalid bearer token', async () => {
    const { port } = await startRealtime();
    const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await once(socket, 'open');
    socket.send(JSON.stringify({ type: 'authenticate', token: 'definitely-invalid' }));
    expect(await nextJson(socket)).toMatchObject({ type: 'error', code: 'SESSION_INVALID' });
    await once(socket, 'close');
  });
});
