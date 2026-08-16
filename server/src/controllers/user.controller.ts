import { Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Like from '../models/Like';
import Bookmark from '../models/Bookmark';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';
import Notification from '../models/Notification';
import { getFileUrl } from '../middleware/upload';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ username: req.params.username })
    .populate('achievements')
    .select('-password -blockedUsers');

  if (!user) throw notFound('User not found');

  const authReq = req as AuthRequest;
  if (user.privacy.profileVisibility === 'private') {
    if (!authReq.user || authReq.user._id.toString() !== user._id.toString()) {
      throw forbidden('This profile is private');
    }
  }

  sendSuccess(res, { user });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const allowed = [
    'name', 'bio', 'headline', 'location', 'profession', 'skills', 'interests',
    'experienceTags', 'socialLinks', 'website', 'privacy', 'notificationSettings',
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(authReq.user!._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  sendSuccess(res, { user }, 'Profile updated');
};

export const followUser = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const targetId = req.params.userId;

  if (authReq.user!._id.toString() === targetId) throw badRequest('Cannot follow yourself');

  const targetIdStr = String(targetId);
  const target = await User.findById(targetIdStr);
  if (!target) throw notFound('User not found');

  const userId = authReq.user!._id;
  const alreadyFollowing = authReq.user!.following.some((id: { toString: () => string }) => id.toString() === targetIdStr);
  if (alreadyFollowing) throw badRequest('Already following');

  await User.findByIdAndUpdate(userId, { $addToSet: { following: targetIdStr } });
  await User.findByIdAndUpdate(targetIdStr, { $addToSet: { followers: userId } });

  await Notification.create({
    recipient: targetIdStr,
    sender: userId,
    type: 'follow',
    title: 'New Follower',
    body: `${authReq.user!.name} started following you`,
    link: `/profile/${authReq.user!.username}`,
  });

  sendSuccess(res, undefined, 'Followed successfully');
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const targetId = req.params.userId;

  await User.findByIdAndUpdate(authReq.user!._id, { $pull: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { followers: authReq.user!._id } });

  sendSuccess(res, undefined, 'Unfollowed successfully');
};

export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw notFound('User not found');

  const total = user.followers.length;
  const followers = await User.find({ _id: { $in: user.followers.slice(skip, skip + limit) } })
    .select('name username avatar bio isVerified');

  sendSuccess(res, { followers, pagination: { page, limit, total } });
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw notFound('User not found');

  const total = user.following.length;
  const following = await User.find({ _id: { $in: user.following.slice(skip, skip + limit) } })
    .select('name username avatar bio isVerified');

  sendSuccess(res, { following, pagination: { page, limit, total } });
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!req.file) throw badRequest('No file uploaded');

  const url = getFileUrl(req.file);
  const user = await User.findByIdAndUpdate(
    authReq.user!._id,
    { avatar: url },
    { new: true }
  ).select('-password');

  sendSuccess(res, { user, url }, 'Avatar updated');
};

export const uploadCover = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!req.file) throw badRequest('No file uploaded');

  const url = getFileUrl(req.file);
  const user = await User.findByIdAndUpdate(
    authReq.user!._id,
    { coverImage: url },
    { new: true }
  ).select('-password');

  sendSuccess(res, { user, url }, 'Cover image updated');
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const targetId = req.params.userId;

  if (authReq.user!._id.toString() === targetId) throw badRequest('Cannot block yourself');

  await User.findByIdAndUpdate(authReq.user!._id, {
    $addToSet: { blockedUsers: targetId },
    $pull: { following: targetId, followers: targetId },
  });
  await User.findByIdAndUpdate(targetId, {
    $pull: { following: authReq.user!._id, followers: authReq.user!._id },
  });

  sendSuccess(res, undefined, 'User blocked');
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!._id;

  const [postsCount, commentsCount, likesReceived, bookmarksCount] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Comment.countDocuments({ author: userId }),
    Like.countDocuments({ targetType: 'post', targetId: { $in: await Post.find({ author: userId }).distinct('_id') } }),
    Bookmark.countDocuments({ user: userId }),
  ]);

  const user = await User.findById(userId).select('followers following xp level dailyStreak badges');

  sendSuccess(res, {
    stats: {
      posts: postsCount,
      comments: commentsCount,
      likesReceived,
      bookmarks: bookmarksCount,
      followers: user?.followers.length || 0,
      following: user?.following.length || 0,
      xp: user?.xp || 0,
      level: user?.level || 1,
      dailyStreak: user?.dailyStreak || 0,
      badges: user?.badges || [],
    },
  });
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!._id;

  await Promise.all([
    Post.deleteMany({ author: userId }),
    Comment.deleteMany({ author: userId }),
    Like.deleteMany({ user: userId }),
    Bookmark.deleteMany({ user: userId }),
    Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
    User.findByIdAndDelete(userId),
  ]);

  sendSuccess(res, undefined, 'Account deleted');
};

export const exportData = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!._id;

  const [user, posts, comments, bookmarks] = await Promise.all([
    User.findById(userId).select('-password'),
    Post.find({ author: userId }),
    Comment.find({ author: userId }),
    Bookmark.find({ user: userId }).populate('post', 'title content'),
  ]);

  sendSuccess(res, {
    exportDate: new Date().toISOString(),
    user,
    posts,
    comments,
    bookmarks,
  });
};
