import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health endpoint', () => {
  it('returns health without leaking configuration', async () => {
    const response = await request(createApp()).get('/api/health').expect(200);
    expect(response.body).toEqual({ ok: true, service: 'veltrix-api' });
    expect(JSON.stringify(response.body)).not.toContain('DATABASE_URL');
  });
});
