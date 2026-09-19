import { randomUUID } from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { AppConfig } from './config.js';
import { ApiError } from './errors.js';
import { clientAuth } from './client/auth.js';
import type { RealtimePublisher } from './realtime/types.js';
import { verifyClientHandoff } from './security/handoff.js';
import { decryptShortSecret, encryptShortSecret } from './security/secrets.js';
import { generateBearerToken, generateVerificationCode, hashToken } from './security/tokens.js';
import type { Cosmetic, VeltrixStore, WebLoginRequest } from './store/types.js';
import { csrfProtection, webAuth } from './web/auth.js';

const sessionInput = z.object({ ticket: z.string().min(20).max(4096) });
const usernameInput = z.object({ minecraftUsername: z.string().regex(/^[A-Za-z0-9_]{3,16}$/) });
const cosmeticInput = z.object({ cosmeticId: z.string().min(1).max(128) });
const adminGrantInput = z.object({
  minecraftUsername: z.string().regex(/^[A-Za-z0-9_]{3,16}$/),
  cosmeticId: z.string().min(1).max(128),
});
const limiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

function publicCosmetic(cosmetic: Cosmetic) {
  return {
    id: cosmetic.id,
    name: cosmetic.name,
    description: cosmetic.description,
    categories: cosmetic.categories,
    category: cosmetic.categories[0] || '',
    slot: cosmetic.slot,
    rarity: cosmetic.rarity,
    priceCents: cosmetic.priceCents,
    currency: cosmetic.currency,
    preview: cosmetic.preview,
    modelId: cosmetic.modelId,
    enabled: cosmetic.enabled,
    purchasable: cosmetic.purchasable,
    limited: cosmetic.limited,
    featured: cosmetic.featured,
    status: cosmetic.purchasable ? 'AVAILABLE' : 'COMING SOON',
    createdAt: cosmetic.createdAt.toISOString(),
  };
}

export function createRoutes(store: VeltrixStore, config: AppConfig, realtime: RealtimePublisher): Router {
  const router = Router();
  const requireClient = clientAuth(store, config);
  const requireWeb = webAuth(store, config);
  const requireCsrf = csrfProtection(config);

  router.post('/client/session', limiter, async (req, res, next) => {
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
        expiresAt: new Date(now.getTime() + 43_200_000), lastSeen: now, revokedAt: null,
      });
      res.status(201).json({ token, expiresIn: 43_200, user: {
        minecraftUsername: user.minecraftUsername, minecraftUuid: user.minecraftUuid, veltrixUserId: user.veltrixUserId,
      } });
    } catch (error) { next(error); }
  });

  router.post('/client/heartbeat', requireClient, async (req, res, next) => {
    try {
      await store.touchClientSession(req.veltrixClientSession!.id, new Date());
      res.status(204).end();
    } catch (error) { next(error); }
  });

  router.post('/client/session/revoke', requireClient, async (req, res, next) => {
    try {
      const session = req.veltrixClientSession!;
      await store.revokeClientSession(session.id, new Date());
      realtime.publish(session.userId, 'session_revoked', { sessionId: session.id });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  router.post('/web-login/request', limiter, async (req, res, next) => {
    try {
      const input = usernameInput.safeParse(req.body);
      if (!input.success) throw new ApiError(400, 'INVALID_USERNAME', 'Enter a valid Minecraft username');
      const now = new Date();
      const active = await store.findActiveClientSessionByUsername(
        input.data.minecraftUsername, new Date(now.getTime() - 120_000), now,
      );
      if (!active) throw new ApiError(404, 'CLIENT_NOT_CONNECTED', 'Veltrix Client not detected');
      await store.expirePendingWebLoginRequests(active.userId, now);
      const code = generateVerificationCode();
      const loginRequest: WebLoginRequest = {
        id: randomUUID(), verificationCodeHash: hashToken(code, config.tokenPepper),
        codeCiphertext: encryptShortSecret(code, config.sessionSecret), minecraftUuid: active.minecraftUuid,
        userId: active.userId, status: 'pending', createdAt: now,
        expiresAt: new Date(now.getTime() + 300_000), approvedAt: null, deniedAt: null, consumedAt: null,
      };
      await store.createWebLoginRequest(loginRequest);
      realtime.publish(active.userId, 'web_login_request', {
        requestId: loginRequest.id, code, expiresAt: loginRequest.expiresAt.toISOString(),
      });
      res.status(201).json({ requestId: loginRequest.id, code, expiresIn: 300 });
    } catch (error) { next(error); }
  });

  router.get('/client/web-login/requests', requireClient, async (req, res, next) => {
    try {
      const requests = await store.listPendingWebLoginRequests(req.veltrixClientSession!.userId, new Date());
      res.json({ requests: requests.map(request => ({
        id: request.id, code: decryptShortSecret(request.codeCiphertext, config.sessionSecret),
        status: request.status, expiresAt: request.expiresAt.toISOString(),
      })) });
    } catch (error) { next(error); }
  });

  const decideLogin = (status: 'approved' | 'denied') => async (
    req: Request, res: Response, next: NextFunction,
  ) => {
    try {
      const session = req.veltrixClientSession!;
      const requestId = String(req.params.id);
      const updated = await store.setWebLoginStatus(requestId, session.userId, status, new Date());
      if (!updated) throw new ApiError(404, 'LOGIN_REQUEST_INVALID', 'Login request is missing, expired or already handled');
      realtime.publish(session.userId, status === 'approved' ? 'web_login_approved' : 'web_login_denied', { requestId });
      res.status(204).end();
    } catch (error) { next(error); }
  };

  router.post('/client/web-login/:id/approve', requireClient, decideLogin('approved'));
  router.post('/client/web-login/:id/deny', requireClient, decideLogin('denied'));

  router.get('/web-login/:id/status', limiter, async (req, res, next) => {
    try {
      const request = await store.getWebLoginRequest(String(req.params.id));
      if (!request) throw new ApiError(404, 'LOGIN_REQUEST_NOT_FOUND', 'Login request not found');
      const status = request.expiresAt <= new Date() && request.status === 'pending' ? 'expired' : request.status;
      res.json({ status });
    } catch (error) { next(error); }
  });

  router.post('/web-login/:id/complete', limiter, async (req, res, next) => {
    try {
      const now = new Date();
      const loginRequest = await store.getWebLoginRequest(String(req.params.id));
      if (!loginRequest) throw new ApiError(404, 'LOGIN_REQUEST_NOT_FOUND', 'Login request not found');
      if (loginRequest.consumedAt) throw new ApiError(409, 'LOGIN_ALREADY_USED', 'Login request was already consumed');
      if (loginRequest.status !== 'approved' || loginRequest.expiresAt <= now) {
        throw new ApiError(409, 'LOGIN_NOT_APPROVED', 'Login request is not approved');
      }
      const claimed = await store.consumeApprovedWebLoginRequest(loginRequest.id, now);
      if (!claimed) throw new ApiError(409, 'LOGIN_ALREADY_USED', 'Login request was already consumed');
      const token = generateBearerToken();
      const csrfToken = generateBearerToken(24);
      await store.createWebSession({
        id: randomUUID(), userId: loginRequest.userId, tokenHash: hashToken(token, config.tokenPepper),
        csrfHash: hashToken(csrfToken, config.tokenPepper), createdAt: now,
        expiresAt: new Date(now.getTime() + 604_800_000), lastSeen: now, revokedAt: null,
      });
      res.cookie('veltrix_web_session', token, {
        httpOnly: true, secure: config.cookieSecure, sameSite: config.cookieSecure ? 'none' : 'lax',
        path: '/', maxAge: 604_800_000,
      });
      res.json({ connected: true, csrfToken });
    } catch (error) { next(error); }
  });

  router.get('/cosmetics', async (_req, res, next) => {
    try { res.json({ cosmetics: (await store.listCosmetics()).map(publicCosmetic) }); }
    catch (error) { next(error); }
  });

  router.get('/cosmetics/owned', requireWeb, async (req, res, next) => {
    try {
      const cosmetics = await store.listOwnedCosmetics(req.veltrixWebSession!.userId);
      res.json({ cosmetics: cosmetics.map(cosmetic => ({
        ...publicCosmetic(cosmetic), owned: true, equipped: cosmetic.equipped,
        purchasedAt: cosmetic.purchasedAt.toISOString(), source: cosmetic.source,
      })) });
    } catch (error) { next(error); }
  });

  router.post('/cosmetics/purchase', requireWeb, requireCsrf, async (_req, _res, next) => {
    next(new ApiError(409, 'PURCHASES_DISABLED', 'Cosmetic purchases are disabled during Beta 1'));
  });

  router.post('/admin/cosmetics/grant', requireWeb, requireCsrf, async (req, res, next) => {
    try {
      const actor = await store.getUserById(req.veltrixWebSession!.userId);
      if (!actor || !['ADMIN', 'OWNER'].includes(actor.role)) {
        throw new ApiError(403, 'ADMIN_REQUIRED', 'Admin or owner access is required');
      }
      const input = adminGrantInput.safeParse(req.body);
      if (!input.success) throw new ApiError(400, 'INVALID_REQUEST', 'Invalid grant request');
      const target = await store.findUserByUsername(input.data.minecraftUsername);
      if (!target) throw new ApiError(404, 'USER_NOT_FOUND', 'VELTRIX user not found');
      const granted = await store.grantCosmetic(target.id, input.data.cosmeticId, 'admin_grant');
      if (!granted) throw new ApiError(404, 'COSMETIC_NOT_FOUND', 'Cosmetic not found');
      realtime.publish(target.id, 'cosmetic_granted', { cosmeticId: input.data.cosmeticId, source: 'admin_grant' });
      res.status(201).json({
        granted: true, minecraftUsername: target.minecraftUsername,
        cosmeticId: input.data.cosmeticId, source: 'admin_grant',
      });
    } catch (error) { next(error); }
  });

  router.get('/cosmetics/:id', async (req, res, next) => {
    try {
      const cosmetic = await store.getCosmetic(String(req.params.id));
      if (!cosmetic) throw new ApiError(404, 'COSMETIC_NOT_FOUND', 'Cosmetic not found');
      res.json({ cosmetic: publicCosmetic(cosmetic) });
    } catch (error) { next(error); }
  });

  router.get('/account', requireWeb, async (req, res, next) => {
    try {
      const session = req.veltrixWebSession!;
      const user = await store.getUserById(session.userId);
      if (!user) throw new ApiError(401, 'WEB_SESSION_INVALID', 'Account no longer exists');
      const now = new Date();
      const csrfToken = generateBearerToken(24);
      await store.updateWebSessionCsrf(session.id, hashToken(csrfToken, config.tokenPepper), now);
      res.json({
        minecraftUsername: user.minecraftUsername, minecraftUuid: user.minecraftUuid,
        veltrixUserId: user.veltrixUserId, memberStatus: user.memberStatus, role: user.role,
        clientConnected: await store.hasActiveClientSession(user.id, new Date(now.getTime() - 120_000), now),
        accountCreated: user.createdAt.toISOString(), csrfToken,
      });
    } catch (error) { next(error); }
  });

  router.get('/client/cosmetics', requireClient, async (req, res, next) => {
    try {
      const cosmetics = await store.listOwnedCosmetics(req.veltrixClientSession!.userId);
      res.json({ cosmetics: cosmetics.map(cosmetic => ({
        ...publicCosmetic(cosmetic), owned: true, equipped: cosmetic.equipped,
      })) });
    } catch (error) { next(error); }
  });

  const mutateCosmetic = (equip: boolean) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = cosmeticInput.safeParse(req.body);
      if (!input.success) throw new ApiError(400, 'INVALID_COSMETIC', 'Invalid cosmetic id');
      const userId = req.veltrixWebSession!.userId;
      const result = equip
        ? await store.equipCosmetic(userId, input.data.cosmeticId)
        : await store.unequipCosmetic(userId, input.data.cosmeticId);
      if (result === 'not_found') throw new ApiError(404, 'COSMETIC_NOT_FOUND', 'Cosmetic not found');
      if (result === 'not_owned') throw new ApiError(403, 'COSMETIC_NOT_OWNED', 'Cosmetic is not owned');
      realtime.publish(userId, equip ? 'cosmetic_equipped' : 'cosmetic_unequipped', { cosmeticId: input.data.cosmeticId });
      res.json({ cosmeticId: input.data.cosmeticId, equipped: equip });
    } catch (error) { next(error); }
  };

  router.post('/cosmetics/equip', requireWeb, requireCsrf, mutateCosmetic(true));
  router.post('/cosmetics/unequip', requireWeb, requireCsrf, mutateCosmetic(false));

  router.post('/web-session/logout', requireWeb, requireCsrf, async (req, res, next) => {
    try {
      await store.revokeWebSession(req.veltrixWebSession!.id, new Date());
      res.clearCookie('veltrix_web_session', { path: '/' });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  return router;
}
