import { Request, Response } from 'express';
import Post from '../models/Post';
import Like from '../models/Like';
import Bookmark from '../models/Bookmark';
import Comment from '../models/Comment';
import User from '../models/User';
import Report from '../models/Report';
import Notification from '../models/Notification';
import { AuthRequest } from '../types/express';
import {
  sendSuccess,
  paginateQuery,
  extractHashtags,
  extractMentions,
  calculateTrendingScore,
} from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';
import { moderateContent } from '../utils/moderation';
import { addXP, checkAndAwardAchievements } from '../utils/gamification';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const moderation = moderateContent(req.body.content || '');
  if (moderation.action === 'block') {
    throw badRequest(`Content blocked: ${moderation.reasons.join(', ')}`);
  }

  const hashtags = extractHashtags(req.body.content || '');
  const mentionUsernames = extractMentions(req.body.content || '');
  const mentionedUsers = await User.find({ username: { $in: mentionUsernames } });
  const mentions = mentionedUsers.map((u) => u._id);

  const post = await Post.create({
    ...req.body,
    author: authReq.user!._id,
    hashtags: [...new Set([...(req.body.hashtags || []), ...hashtags])],
    mentions,
    trendingScore: 0,
  });

  if (req.body.community) {
    const Community = (await import('../models/Community')).default;
    await Community.findByIdAndUpdate(req.body.community, { $inc: { postCount: 1 } });
  }

  await addXP(authReq.user!._id, 10);
  await checkAndAwardAchievements(authReq.user!._id);

  for (const user of mentionedUsers) {
    await Notification.create({
      recipient: user._id,
      sender: authReq.user!._id,
      type: 'mention',
      title: 'You were mentioned',
      body: `${authReq.user!.name} mentioned you in a post`,
      link: `/posts/${post._id}`,
    });
  }

  const populated = await post.populate('author', 'name username avatar');
  sendSuccess(res, { post: populated }, 'Post created', 201);
};

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);
  const cursor = req.query.cursor as string;

  const filter: Record<string, unknown> = {};

  if (req.query.community) filter.community = req.query.community;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.hashtag) filter.hashtags = (req.query.hashtag as string).toLowerCase();

  if (authReq.user) {
    const user = await User.findById(authReq.user._id);
    if (user?.following.length) {
      filter.$or = [
        { author: { $in: user.following } },
        { community: { $in: user.communities } },
      ];
    }
  }

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(cursor ? 0 : skip)
    .limit(limit)
    .populate('author', 'name username avatar isVerified')
    .populate('community', 'name slug logo');

  const nextCursor = posts.length === limit ? posts[posts.length - 1].createdAt.toISOString() : null;

  sendSuccess(res, { posts, nextCursor });
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name username avatar isVerified bio')
    .populate('community', 'name slug logo');

  if (!post) throw notFound('Post not found');

  await Post.findByIdAndUpdate(post._id, { $inc: { viewsCount: 1 } });

  sendSuccess(res, { post });
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const post = await Post.findById(req.params.id);
  if (!post) throw notFound('Post not found');
  if (post.author.toString() !== authReq.user!._id.toString()) throw forbidden('Not authorized');

  const allowed = ['title', 'content', 'markdown', 'type', 'media', 'codeLanguage', 'codeContent', 'linkUrl'] as const;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (post as unknown as Record<string, unknown>)[key] = req.body[key];
    }
  }

  if (req.body.content) {
    post.hashtags = extractHashtags(req.body.content);
  }

  await post.save();
  sendSuccess(res, { post }, 'Post updated');
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const post = await Post.findById(req.params.id);
  if (!post) throw notFound('Post not found');

  const isAuthor = post.author.toString() === authReq.user!._id.toString();
  const isAdmin = authReq.user!.role === 'admin' || authReq.user!.role === 'moderator';
  if (!isAuthor && !isAdmin) throw forbidden('Not authorized');

  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    Like.deleteMany({ targetType: 'post', targetId: post._id }),
    Bookmark.deleteMany({ post: post._id }),
    Post.findByIdAndDelete(post._id),
  ]);

  sendSuccess(res, undefined, 'Post deleted');
};

export const likePost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const postId = String(req.params.id);
  const post = await Post.findById(postId);
  if (!post) throw notFound('Post not found');

  const existing = await Like.findOne({
    user: authReq.user!._id,
    targetType: 'post',
    targetId: postId,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    sendSuccess(res, { liked: false }, 'Post unliked');
    return;
  }

  await Like.create({ user: authReq.user!._id, targetType: 'post', targetId: postId });
  post.likesCount += 1;
  post.trendingScore = calculateTrendingScore(
    post.likesCount, post.commentsCount, post.sharesCount, post.viewsCount, post.createdAt
  );
  await post.save();

  if (post.author.toString() !== authReq.user!._id.toString()) {
    await Notification.create({
      recipient: post.author,
      sender: authReq.user!._id,
      type: 'like',
      title: 'New Like',
      body: `${authReq.user!.name} liked your post`,
      link: `/posts/${post._id}`,
    });
  }

  sendSuccess(res, { liked: true }, 'Post liked');
};

export const bookmarkPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const postId = String(req.params.id);
  const post = await Post.findById(postId);
  if (!post) throw notFound('Post not found');

  const existing = await Bookmark.findOne({ user: authReq.user!._id, post: postId });

  if (existing) {
    await Bookmark.deleteOne({ _id: existing._id });
    post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
    await post.save();
    sendSuccess(res, { bookmarked: false }, 'Bookmark removed');
    return;
  }

  await Bookmark.create({ user: authReq.user!._id, post: postId });
  post.bookmarksCount += 1;
  await post.save();
  sendSuccess(res, { bookmarked: true }, 'Post bookmarked');
};

export const sharePost = async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { sharesCount: 1 } },
    { new: true }
  );
  if (!post) throw notFound('Post not found');
  sendSuccess(res, { sharesCount: post.sharesCount }, 'Post shared');
};

export const reportPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const post = await Post.findById(req.params.id);
  if (!post) throw notFound('Post not found');

  await Report.create({
    reporter: authReq.user!._id,
    targetType: 'post',
    targetId: post._id,
    reason: req.body.reason,
    details: req.body.details,
  });

  post.isReported = true;
  await post.save();
  sendSuccess(res, undefined, 'Report submitted');
};

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  const { limit } = paginateQuery(1, req.query.limit as string);

  const posts = await Post.find()
    .sort({ trendingScore: -1, likesCount: -1 })
    .limit(limit)
    .populate('author', 'name username avatar')
    .populate('community', 'name slug');

  sendSuccess(res, { posts });
};

export const votePoll = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { optionIndex } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post || post.type !== 'poll') throw badRequest('Invalid poll');
  if (optionIndex < 0 || optionIndex >= post.pollOptions.length) throw badRequest('Invalid option');

  for (const option of post.pollOptions) {
    option.votes = option.votes.filter((v) => v.toString() !== authReq.user!._id.toString());
  }
  post.pollOptions[optionIndex].votes.push(authReq.user!._id);
  await post.save();

  sendSuccess(res, { pollOptions: post.pollOptions }, 'Vote recorded');
};
