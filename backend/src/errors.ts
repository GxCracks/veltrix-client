import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'NOT_FOUND', 'Route not found'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({ code: error.code, message: error.message });
    return;
  }
  if (process.env.NODE_ENV !== 'test') console.error('Unhandled API error');
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
}
