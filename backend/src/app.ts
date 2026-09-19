import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { loadConfig, type AppConfig } from './config.js';
import { errorHandler, notFound } from './errors.js';
import { createRoutes } from './routes.js';

export type AppDeps = {
  config: AppConfig;
};

export function createApp(deps: Partial<AppDeps> = {}): Express {
  const config = deps.config ?? loadConfig({ ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'test' });
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
    }
  }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'veltrix-api' });
  });

  app.use('/api', createRoutes());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
