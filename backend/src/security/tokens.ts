import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { loadConfig } from '../config.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateBearerToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string, pepper = loadConfig().tokenPepper): string {
  return createHmac('sha256', pepper).update(token, 'utf8').digest('hex');
}

function codePart(length: number): string {
  let value = '';
  for (let i = 0; i < length; i += 1) value += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)];
  return value;
}

export function generateVerificationCode(): string {
  return `VEL-${codePart(4)}-${codePart(4)}`;
}
