import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Types } from 'mongoose';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
}

interface TokenUser {
  _id: Types.ObjectId;
  role: string;
}

export const generateAccessToken = (user: TokenUser): string =>
  jwt.sign({ userId: user._id.toString(), role: user.role } as TokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const generateRefreshToken = (user: TokenUser): string =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role } as TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

export const extractToken = (authHeader?: string, cookieToken?: string): string | null => {
  if (cookieToken) return cookieToken;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
};
