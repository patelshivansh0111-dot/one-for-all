import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { forbidden } from '../utils/apiError';
import { UserRole } from '../models/User';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return next(forbidden('Insufficient permissions'));
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireModerator = requireRole('moderator', 'admin');
