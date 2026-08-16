import { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'crypto';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response =>
  res.status(statusCode).json({
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  });

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500
): Response =>
  res.status(statusCode).json({
    success: false,
    error,
  });

export const generateToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\w\u0590-\u05ff]+/g);
  return matches ? [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))] : [];
};

export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@[\w]+/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1).toLowerCase()))] : [];
};

export const paginateQuery = (
  page?: string | number,
  limit?: string | number
): { skip: number; limit: number; page: number } => {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit || 20), 10)));
  return { skip: (pageNum - 1) * limitNum, limit: limitNum, page: pageNum };
};

export const calculateTrendingScore = (
  likes: number,
  comments: number,
  shares: number,
  views: number,
  createdAt: Date
): number => {
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const engagement = likes * 3 + comments * 5 + shares * 7 + views * 0.1;
  const timeDecay = Math.pow(hoursSinceCreation + 2, 1.5);
  return engagement / timeDecay;
};

export const sanitizeUser = (user: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.emailVerificationToken;
  delete sanitized.resetPasswordToken;
  delete sanitized.resetPasswordExpires;
  return sanitized;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
};
