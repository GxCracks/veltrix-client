import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { loadConfig, type AppConfig } from './config.js';
import { getPool } from './db/pool.js';
import { errorHandler, notFound } from './errors.js';
import { noRealtime, type RealtimePublisher } from './realtime/types.js';
import { createRoutes } from './routes.js';
import { MemoryStore } from './store/memory.js';
import { PostgresStore } from './store/postgres.js';
import type { VeltrixStore } from './store/types.js';

export type AppDeps = {
  config: AppConfig;
  store: VeltrixStore;
  realtime: RealtimePublisher;
};

function defaultStore(config: AppConfig): VeltrixStore {
  if (config.databaseUrl) return new PostgresStore(getPool());
  if (config.nodeEnv === 'production') throw new Error('Persistent store required in production');
  return new MemoryStore();
}

export function createApp(deps: Partial<AppDeps> = {}): Express {
  const config = deps.config ?? loadConfig({ ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'test' });
  const store = deps.store ?? defaultStore(config);
  const realtime = deps.realtime ?? noRealtime;
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed'));
    },
  }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'veltrix-api' });
  });
  app.use('/api', createRoutes(store, config, realtime));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
