import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types/express';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { generateToken, sendSuccess } from '../utils/helpers';
import { badRequest, unauthorized, notFound } from '../utils/apiError';
import { updateDailyStreak } from '../utils/gamification';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });
  if (existing) {
    throw badRequest(
      existing.email === email.toLowerCase() ? 'Email already registered' : 'Username taken'
    );
  }

  const verificationToken = generateToken();
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    emailVerificationToken: verificationToken,
  });

  await sendVerificationEmail(user.email, verificationToken);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(
    res,
    {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
    'Registration successful. Please verify your email.',
    201
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) throw unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw unauthorized('Invalid credentials');
  if (user.isBanned) throw unauthorized(`Account banned: ${user.banReason || 'Policy violation'}`);

  await updateDailyStreak(user._id);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(res, {
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      xp: user.xp,
      level: user.level,
    },
    accessToken,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookies(res);
  sendSuccess(res, undefined, 'Logged out successfully');
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const resetToken = generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user.email, resetToken);
  }

  sendSuccess(res, undefined, 'If that email exists, a reset link has been sent');
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw badRequest('Invalid or expired reset token');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendSuccess(res, undefined, 'Password reset successful');
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token }).select(
    '+emailVerificationToken'
  );
  if (!user) throw badRequest('Invalid verification token');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  sendSuccess(res, undefined, 'Email verified successfully');
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.user!._id)
    .populate('achievements')
    .select('-password');

  sendSuccess(res, { user });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) throw unauthorized('Refresh token required');

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId);
  if (!user || user.isBanned) throw unauthorized('Invalid refresh token');

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, newRefreshToken);

  sendSuccess(res, { accessToken });
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as Express.User;
  if (!user) throw notFound('Google authentication failed');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?success=true`);
};
