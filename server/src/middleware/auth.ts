import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { verifyAccessToken, extractToken } from '../utils/jwt';
import { unauthorized, forbidden } from '../utils/apiError';
import { AuthRequest } from '../types/express';

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const token = extractToken(
      req.headers.authorization,
      req.cookies?.accessToken
    );

    if (!token) return next(unauthorized('Authentication required'));

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return next(unauthorized('User not found'));
    if (user.isBanned) return next(forbidden(`Account banned: ${user.banReason || 'Policy violation'}`));

    authReq.user = user as AuthRequest['user'];
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const token = extractToken(
      req.headers.authorization,
      req.cookies?.accessToken
    );

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && !user.isBanned) authReq.user = user as AuthRequest['user'];
    }
    next();
  } catch {
    next();
  }
};
