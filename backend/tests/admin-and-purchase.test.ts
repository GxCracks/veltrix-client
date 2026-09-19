import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { signClientHandoff } from '../src/security/handoff.js';
import { hashToken } from '../src/security/tokens.js';
import { MemoryStore } from '../src/store/memory.js';

const config = loadConfig({
  NODE_ENV: 'test', PORT: '3000', CORS_ORIGIN: 'https://gxcracks.github.io',
  SESSION_SECRET: 'session-secret-for-tests-123456', TOKEN_PEPPER: 'token-pepper-for-tests-12345678',
  CLIENT_HANDOFF_SECRET: 'handoff-secret-for-tests-1234567890', COOKIE_SECURE: 'false'
});

async function establish(app: ReturnType<typeof createApp>, store: MemoryStore, identity: { veltrixUserId:string; minecraftUuid:string; minecraftUsername:string }) {
  const ticket = signClientHandoff({ ...identity, expiresAt: Date.now() + 60_000 }, config.clientHandoffSecret);
  const client = await request(app).post('/api/client/session').send({ ticket }).expect(201);
  const clientToken = client.body.token as string;
  const clientSession = await store.getClientSessionByHash(hashToken(clientToken, config.tokenPepper));
  if (!clientSession) throw new Error('client session missing');
  const web = request.agent(app);
  const login = await web.post('/api/web-login/request').send({ minecraftUsername: identity.minecraftUsername }).expect(201);
  await request(app).post(`/api/client/web-login/${login.body.requestId}/approve`).set('Authorization', `Bearer ${clientToken}`).expect(204);
  await web.post(`/api/web-login/${login.body.requestId}/complete`).expect(200);
  const account = await web.get('/api/account').expect(200);
  return { web, clientToken, userId: clientSession.userId, csrfToken: account.body.csrfToken as string };
}

describe('Beta 1 purchase lock and admin grants', () => {
  it('keeps checkout disabled even for a verified account', async () => {
    const store = new MemoryStore();
    const app = createApp({ config, store });
    const user = await establish(app, store, {
      veltrixUserId:'buyer-1', minecraftUuid:'11111111-2222-3333-4444-555555555555', minecraftUsername:'BuyerOne'
    });
    const response = await user.web.post('/api/cosmetics/purchase')
      .set('x-csrf-token', user.csrfToken).send({ cosmeticId:'veltrix_dragon' }).expect(409);
    expect(response.body.code).toBe('PURCHASES_DISABLED');
    expect(await store.listOwnedCosmetics(user.userId)).toHaveLength(0);
  });

  it('allows only ADMIN or OWNER to grant an existing cosmetic', async () => {
    const store = new MemoryStore();
    const app = createApp({ config, store });
    const admin = await establish(app, store, {
      veltrixUserId:'admin-1', minecraftUuid:'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', minecraftUsername:'VelAdmin'
    });
    const target = await establish(app, store, {
      veltrixUserId:'target-1', minecraftUuid:'99999999-8888-7777-6666-555555555555', minecraftUsername:'TargetUser'
    });

    const denied = await admin.web.post('/api/admin/cosmetics/grant')
      .set('x-csrf-token', admin.csrfToken).send({ minecraftUsername:'TargetUser', cosmeticId:'veltrix_dragon' }).expect(403);
    expect(denied.body.code).toBe('ADMIN_REQUIRED');

    const promoted = store as MemoryStore & { setUserRole(userId:string, role:'OWNER'): Promise<void> };
    await promoted.setUserRole(admin.userId, 'OWNER');
    const refreshed = await admin.web.get('/api/account').expect(200);

    await admin.web.post('/api/admin/cosmetics/grant')
      .set('x-csrf-token', refreshed.body.csrfToken).send({ minecraftUsername:'TargetUser', cosmeticId:'veltrix_dragon' }).expect(201);

    const owned = await store.listOwnedCosmetics(target.userId);
    expect(owned).toHaveLength(1);
    expect(owned[0]).toMatchObject({ id:'veltrix_dragon', source:'admin_grant' });
  });
});
