import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from '../config.js';
import { ApiError } from '../errors.js';
import { hashToken } from '../security/tokens.js';
import type { ClientSession, VeltrixStore } from '../store/types.js';

declare global {
  namespace Express {
    interface Request { veltrixClientSession?: ClientSession; }
  }
}

export function clientAuth(store: VeltrixStore, config: AppConfig) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = req.get('authorization') || '';
      const match = /^Bearer\s+(.+)$/i.exec(auth);
      if (!match) throw new ApiError(401, 'SESSION_INVALID', 'Valid client session required');
      const session = await store.getClientSessionByHash(hashToken(match[1], config.tokenPepper));
      const now = new Date();
      if (!session || session.revokedAt || session.expiresAt <= now) throw new ApiError(401, 'SESSION_INVALID', 'Client session expired or revoked');
      req.veltrixClientSession = session;
      next();
    } catch (error) { next(error); }
  };
}
