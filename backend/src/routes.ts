import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from './config.js';
import { ApiError } from './errors.js';
import { clientAuth } from './client/auth.js';
import { verifyClientHandoff } from './security/handoff.js';
import { generateBearerToken, hashToken } from './security/tokens.js';
import type { VeltrixStore } from './store/types.js';

const sessionInput = z.object({ ticket: z.string().min(20).max(4096) });

export function createRoutes(store: VeltrixStore, config: AppConfig): Router {
  const router = Router();
  const requireClient = clientAuth(store, config);

  router.post('/client/session', async (req, res, next) => {
    try {
      const input = sessionInput.safeParse(req.body);
      if (!input.success) throw new ApiError(400, 'INVALID_REQUEST', 'Invalid session request');
      const identity = verifyClientHandoff(input.data.ticket, config.clientHandoffSecret);
      if (!identity) throw new ApiError(401, 'HANDOFF_INVALID', 'Identity handoff is invalid or expired');
      const user = await store.upsertUser(identity);
      const token = generateBearerToken();
      const now = new Date();
      await store.createClientSession({
        id: randomUUID(), userId: user.id, minecraftUuid: user.minecraftUuid,
        tokenHash: hashToken(token, config.tokenPepper), createdAt: now,
        expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), lastSeen: now, revokedAt: null
      });
      res.status(201).json({ token, expiresIn: 43_200, user: { minecraftUsername: user.minecraftUsername, minecraftUuid: user.minecraftUuid, veltrixUserId: user.veltrixUserId } });
    } catch (error) { next(error); }
  });

  router.post('/client/heartbeat', requireClient, async (req, res, next) => {
    try { await store.touchClientSession(req.veltrixClientSession!.id, new Date()); res.status(204).end(); } catch (error) { next(error); }
  });

  router.post('/client/session/revoke', requireClient, async (req, res, next) => {
    try { await store.revokeClientSession(req.veltrixClientSession!.id, new Date()); res.status(204).end(); } catch (error) { next(error); }
  });

  return router;
}
