import { Request, Response } from 'express';
import Achievement from '../models/Achievement';
import { AuthRequest } from '../types/express';
import { sendSuccess } from '../utils/helpers';
import { checkAndAwardAchievements, getLeaderboard } from '../utils/gamification';

export const listAchievements = async (_req: Request, res: Response): Promise<void> => {
  const achievements = await Achievement.find().sort({ xpReward: 1 });
  sendSuccess(res, { achievements });
};

export const getLeaderboardHandler = async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(parseInt(String(req.query.limit || 20), 10), 50);
  const leaderboard = await getLeaderboard(limit);
  sendSuccess(res, { leaderboard });
};

export const checkAchievements = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const awarded = await checkAndAwardAchievements(authReq.user!._id);
  sendSuccess(res, { awarded, count: awarded.length }, awarded.length ? 'New achievements unlocked!' : 'No new achievements');
};

export const getMyAchievements = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const User = (await import('../models/User')).default;
  const user = await User.findById(authReq.user!._id).populate('achievements');
  sendSuccess(res, {
    achievements: user?.achievements || [],
    badges: user?.badges || [],
    xp: user?.xp || 0,
    level: user?.level || 1,
    dailyStreak: user?.dailyStreak || 0,
  });
};
