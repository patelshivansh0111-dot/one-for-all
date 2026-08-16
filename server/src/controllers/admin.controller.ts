import { Request, Response } from 'express';
import User from '../models/User';
import Community from '../models/Community';
import Post from '../models/Post';
import Report from '../models/Report';
import Event from '../models/Event';
import Comment from '../models/Comment';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, badRequest } from '../utils/apiError';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { username: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name username email role isVerified isBanned createdAt xp level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, { users, pagination: { page, limit, total } });
};

export const banUser = async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isBanned: true, banReason: reason || 'Policy violation' },
    { new: true }
  ).select('name username isBanned banReason');

  if (!user) throw notFound('User not found');
  sendSuccess(res, { user }, 'User banned');
};

export const unbanUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isBanned: false, banReason: undefined },
    { new: true }
  ).select('name username isBanned');

  if (!user) throw notFound('User not found');
  sendSuccess(res, { user }, 'User unbanned');
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) throw badRequest('Invalid role');

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { role },
    { new: true }
  ).select('name username role');

  if (!user) throw notFound('User not found');
  sendSuccess(res, { user }, 'Role updated');
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'name username')
      .populate('reviewedBy', 'name username'),
    Report.countDocuments(filter),
  ]);

  sendSuccess(res, { reports, pagination: { page, limit, total } });
};

export const reviewReport = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as import('../types/express').AuthRequest;
  const { status, action } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) throw notFound('Report not found');

  report.status = status;
  report.reviewedBy = authReq.user!._id;
  await report.save();

  if (action === 'remove_content' && report.targetType === 'post') {
    await Post.findByIdAndDelete(report.targetId);
  } else if (action === 'remove_content' && report.targetType === 'comment') {
    await Comment.findByIdAndDelete(report.targetId);
  } else if (action === 'ban_user' && report.targetType === 'user') {
    await User.findByIdAndUpdate(report.targetId, {
      isBanned: true,
      banReason: report.reason,
    });
  }

  sendSuccess(res, { report }, 'Report reviewed');
};

export const getCommunities = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);

  const communities = await Community.find()
    .sort({ memberCount: -1 })
    .skip(skip)
    .limit(limit)
    .populate('creator', 'name username');

  sendSuccess(res, { communities });
};

export const deleteCommunity = async (req: Request, res: Response): Promise<void> => {
  const community = await Community.findByIdAndDelete(req.params.id);
  if (!community) throw notFound('Community not found');

  await Post.deleteMany({ community: community._id });
  sendSuccess(res, undefined, 'Community deleted');
};

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalUsers,
    activeUsers,
    totalPosts,
    totalCommunities,
    totalEvents,
    pendingReports,
    bannedUsers,
    newUsersToday,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActiveDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    Post.countDocuments(),
    Community.countDocuments(),
    Event.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);

  sendSuccess(res, {
    analytics: {
      totalUsers,
      activeUsers,
      totalPosts,
      totalCommunities,
      totalEvents,
      pendingReports,
      bannedUsers,
      newUsersToday,
    },
  });
};
