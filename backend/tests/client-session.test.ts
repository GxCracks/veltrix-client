import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { signClientHandoff } from '../src/security/handoff.js';
import { MemoryStore } from '../src/store/memory.js';

const config = loadConfig({
  NODE_ENV: 'test',
  PORT: '3000',
  CORS_ORIGIN: 'https://gxcracks.github.io',
  SESSION_SECRET: 'session-secret-for-tests-123456',
  TOKEN_PEPPER: 'token-pepper-for-tests-12345678',
  CLIENT_HANDOFF_SECRET: 'handoff-secret-for-tests-1234567890',
  COOKIE_SECURE: 'true'
});

describe('VELTRIX client sessions', () => {
  it('creates, heartbeats and revokes a session from a signed identity handoff', async () => {
    const store = new MemoryStore();
    const app = createApp({ config, store });
    const ticket = signClientHandoff({
      veltrixUserId: 'vel-user-1',
      minecraftUuid: '11111111-2222-3333-4444-555555555555',
      minecraftUsername: 'PlayerOne',
      expiresAt: Date.now() + 60_000
    }, config.clientHandoffSecret);

    const created = await request(app).post('/api/client/session').send({ ticket }).expect(201);
    expect(created.body.token).toEqual(expect.any(String));
    expect(created.body.user.minecraftUsername).toBe('PlayerOne');

    await request(app).post('/api/client/heartbeat')
      .set('Authorization', `Bearer ${created.body.token}`)
      .expect(204);

    await request(app).post('/api/client/session/revoke')
      .set('Authorization', `Bearer ${created.body.token}`)
      .expect(204);

    const rejected = await request(app).post('/api/client/heartbeat')
      .set('Authorization', `Bearer ${created.body.token}`)
      .expect(401);
    expect(rejected.body.code).toBe('SESSION_INVALID');
  });

  it('rejects an expired or tampered identity handoff', async () => {
    const app = createApp({ config, store: new MemoryStore() });
    const expired = signClientHandoff({
      veltrixUserId: 'vel-user-2',
      minecraftUuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      minecraftUsername: 'ExpiredUser',
      expiresAt: Date.now() - 1
    }, config.clientHandoffSecret);

    await request(app).post('/api/client/session').send({ ticket: expired }).expect(401);
    await request(app).post('/api/client/session').send({ ticket: `${expired}x` }).expect(401);
  });
});
