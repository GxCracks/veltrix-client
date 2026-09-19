import { Pool } from 'pg';
import { loadConfig } from '../config.js';

let sharedPool: Pool | undefined;

export function createPool(connectionString: string): Pool {
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
}

export function getPool(): Pool {
  if (sharedPool) return sharedPool;
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('DATABASE_URL is required for database operations');
  sharedPool = createPool(config.databaseUrl);
  return sharedPool;
}

export async function closePool(): Promise<void> {
  if (!sharedPool) return;
  await sharedPool.end();
  sharedPool = undefined;
}
