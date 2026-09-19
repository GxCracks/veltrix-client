import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  TOKEN_PEPPER: z.string().min(16).optional(),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:8080'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('true')
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  databaseUrl?: string;
  sessionSecret: string;
  tokenPepper: string;
  corsOrigins: string[];
  cookieSecure: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = schema.parse(env);
  const production = parsed.NODE_ENV === 'production';
  if (production && !parsed.DATABASE_URL) throw new Error('DATABASE_URL is required in production');
  if (production && !parsed.SESSION_SECRET) throw new Error('SESSION_SECRET is required in production');
  if (production && !parsed.TOKEN_PEPPER) throw new Error('TOKEN_PEPPER is required in production');
  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    databaseUrl: parsed.DATABASE_URL,
    sessionSecret: parsed.SESSION_SECRET ?? 'test-session-secret-not-for-production',
    tokenPepper: parsed.TOKEN_PEPPER ?? 'test-token-pepper-not-for-production',
    corsOrigins: parsed.CORS_ORIGIN.split(',').map(value => value.trim()).filter(Boolean),
    cookieSecure: parsed.COOKIE_SECURE === 'true'
  };
}
