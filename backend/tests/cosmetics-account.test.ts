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

async function establish(app: ReturnType<typeof createApp>, store: MemoryStore) {
  const ticket = signClientHandoff({
    veltrixUserId: 'vel-owner-1', minecraftUuid: 'abcdefab-cdef-abcd-efab-cdefabcdefab',
    minecraftUsername: 'CosmeticUser', expiresAt: Date.now() + 60_000
  }, config.clientHandoffSecret);
  const client = await request(app).post('/api/client/session').send({ ticket }).expect(201);
  const clientToken = client.body.token as string;
  const session = await store.getClientSessionByHash(hashToken(clientToken, config.tokenPepper));
  if (!session) throw new Error('client session missing');
  await store.grantCosmetic(session.userId, 'veltrix_dragon', 'beta_reward');

  const web = request.agent(app);
  const login = await web.post('/api/web-login/request').send({ minecraftUsername: 'CosmeticUser' }).expect(201);
  await request(app).post(`/api/client/web-login/${login.body.requestId}/approve`).set('Authorization', `Bearer ${clientToken}`).expect(204);
  await web.post(`/api/web-login/${login.body.requestId}/complete`).expect(200);
  return { web, clientToken };
}

describe('cosmetics account API', () => {
  it('keeps catalog public but protects ownership and enforces CSRF on equip', async () => {
    const store = new MemoryStore();
    const app = createApp({ config, store });

    const catalog = await request(app).get('/api/cosmetics').expect(200);
    expect(catalog.body.cosmetics[0]).toMatchObject({ id: 'veltrix_dragon', rarity: 'LEGENDARY', purchasable: false });
    await request(app).get('/api/cosmetics/owned').expect(401);

    const { web, clientToken } = await establish(app, store);
    const account = await web.get('/api/account').expect(200);
    expect(account.body).toMatchObject({ minecraftUsername: 'CosmeticUser', clientConnected: true });
    expect(account.body.csrfToken).toEqual(expect.any(String));

    const owned = await web.get('/api/cosmetics/owned').expect(200);
    expect(owned.body.cosmetics[0]).toMatchObject({ id: 'veltrix_dragon', owned: true, equipped: false });

    const noCsrf = await web.post('/api/cosmetics/equip').send({ cosmeticId: 'veltrix_dragon' }).expect(403);
    expect(noCsrf.body.code).toBe('CSRF_INVALID');

    await web.post('/api/cosmetics/equip').set('x-csrf-token', account.body.csrfToken).send({ cosmeticId: 'veltrix_dragon' }).expect(200);
    const equipped = await web.get('/api/cosmetics/owned').expect(200);
    expect(equipped.body.cosmetics[0].equipped).toBe(true);

    const clientState = await request(app).get('/api/client/cosmetics').set('Authorization', `Bearer ${clientToken}`).expect(200);
    expect(clientState.body.cosmetics[0].equipped).toBe(true);
  });

  it('rejects equip when the cosmetic is not owned', async () => {
    const store = new MemoryStore();
    const app = createApp({ config, store });
    const ticket = signClientHandoff({ veltrixUserId:'vel-no-owner',minecraftUuid:'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',minecraftUsername:'NoOwner',expiresAt:Date.now()+60_000 },config.clientHandoffSecret);
    const client = await request(app).post('/api/client/session').send({ticket}).expect(201);
    const web=request.agent(app);const login=await web.post('/api/web-login/request').send({minecraftUsername:'NoOwner'}).expect(201);
    await request(app).post(`/api/client/web-login/${login.body.requestId}/approve`).set('Authorization',`Bearer ${client.body.token}`).expect(204);
    await web.post(`/api/web-login/${login.body.requestId}/complete`).expect(200);
    const account=await web.get('/api/account').expect(200);
    const denied=await web.post('/api/cosmetics/equip').set('x-csrf-token',account.body.csrfToken).send({cosmeticId:'veltrix_dragon'}).expect(403);
    expect(denied.body.code).toBe('COSMETIC_NOT_OWNED');
  });
});
