import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    res.status(409).json({ success: false, error: `${field} already exists` });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expired' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'Route not found' });
};
