import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { signClientHandoff } from '../src/security/handoff.js';
import { MemoryStore } from '../src/store/memory.js';

const config = loadConfig({
  NODE_ENV: 'test', PORT: '3000', CORS_ORIGIN: 'https://gxcracks.github.io',
  SESSION_SECRET: 'session-secret-for-tests-123456', TOKEN_PEPPER: 'token-pepper-for-tests-12345678',
  CLIENT_HANDOFF_SECRET: 'handoff-secret-for-tests-1234567890', COOKIE_SECURE: 'true'
});

async function clientLogin(app: ReturnType<typeof createApp>) {
  const ticket = signClientHandoff({
    veltrixUserId: 'vel-user-login', minecraftUuid: '12345678-1234-1234-1234-123456789abc',
    minecraftUsername: 'VelPlayer', expiresAt: Date.now() + 60_000
  }, config.clientHandoffSecret);
  return (await request(app).post('/api/client/session').send({ ticket }).expect(201)).body.token as string;
}

describe('one-time website login', () => {
  it('requires active client confirmation before creating a web session', async () => {
    const app = createApp({ config, store: new MemoryStore() });
    const clientToken = await clientLogin(app);
    const web = request.agent(app);

    const login = await web.post('/api/web-login/request').send({ minecraftUsername: 'VelPlayer' }).expect(201);
    expect(login.body.code).toMatch(/^VEL-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    const pending = await request(app).get('/api/client/web-login/requests')
      .set('Authorization', `Bearer ${clientToken}`).expect(200);
    expect(pending.body.requests[0]).toMatchObject({ id: login.body.requestId, code: login.body.code, status: 'pending' });

    await request(app).post(`/api/client/web-login/${login.body.requestId}/approve`)
      .set('Authorization', `Bearer ${clientToken}`).expect(204);

    const status = await web.get(`/api/web-login/${login.body.requestId}/status`).expect(200);
    expect(status.body.status).toBe('approved');

    const completed = await web.post(`/api/web-login/${login.body.requestId}/complete`).expect(200);
    expect(completed.body.csrfToken).toEqual(expect.any(String));
    const cookies = String(completed.headers['set-cookie'] ?? '');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('SameSite=None');

    const reused = await web.post(`/api/web-login/${login.body.requestId}/complete`).expect(409);
    expect(reused.body.code).toBe('LOGIN_ALREADY_USED');
  });

  it('does not authenticate a username without an active client session', async () => {
    const app = createApp({ config, store: new MemoryStore() });
    const response = await request(app).post('/api/web-login/request').send({ minecraftUsername: 'NobodyHere' }).expect(404);
    expect(response.body.code).toBe('CLIENT_NOT_CONNECTED');
  });
});
