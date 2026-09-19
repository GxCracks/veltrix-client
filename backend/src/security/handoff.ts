import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const payloadSchema = z.object({
  veltrixUserId: z.string().min(1).max(128),
  minecraftUuid: z.string().regex(/^(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/),
  minecraftUsername: z.string().regex(/^[A-Za-z0-9_]{3,16}$/),
  expiresAt: z.number().int().positive()
});

export type ClientHandoffPayload = z.infer<typeof payloadSchema>;

function signature(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

export function signClientHandoff(payload: ClientHandoffPayload, secret: string): string {
  const valid = payloadSchema.parse(payload);
  const encoded = Buffer.from(JSON.stringify(valid), 'utf8').toString('base64url');
  return `${encoded}.${signature(encoded, secret)}`;
}

export function verifyClientHandoff(ticket: string, secret: string, now = Date.now()): ClientHandoffPayload | null {
  const [encoded, suppliedSignature, ...extra] = ticket.split('.');
  if (!encoded || !suppliedSignature || extra.length) return null;
  const expected = signature(encoded, secret);
  const a = Buffer.from(suppliedSignature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = payloadSchema.parse(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')));
    if (payload.expiresAt <= now) return null;
    return payload;
  } catch {
    return null;
  }
}
