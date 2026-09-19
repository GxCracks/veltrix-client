import { describe, expect, it } from 'vitest';
import { generateBearerToken, generateVerificationCode, hashToken } from '../src/security/tokens.js';

describe('token primitives', () => {
  it('generates non-repeatable bearer tokens and stable hashes', () => {
    const a = generateBearerToken();
    const b = generateBearerToken();
    expect(a).not.toBe(b);
    expect(hashToken(a)).not.toBe(a);
    expect(hashToken(a)).toBe(hashToken(a));
  });

  it('generates readable VEL verification codes', () => {
    expect(generateVerificationCode()).toMatch(/^VEL-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});
