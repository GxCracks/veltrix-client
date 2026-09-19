import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { getPool, closePool } from './pool.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(here, '../../migrations/001_initial.sql');

async function main(): Promise<void> {
  const sql = await readFile(migrationPath, 'utf8');
  const pool = getPool();
  await pool.query(sql);
  console.log('VELTRIX database migration complete');
  await closePool();
}

main().catch(async error => {
  console.error('VELTRIX database migration failed');
  console.error(error instanceof Error ? error.message : String(error));
  await closePool();
  process.exitCode = 1;
});
