import { Request, Response } from 'express';
import User from '../models/User';
import Community from '../models/Community';
import Post from '../models/Post';
import Event from '../models/Event';
import Question from '../models/Question';
import { sendSuccess } from '../utils/helpers';
import { badRequest } from '../utils/apiError';

export const unifiedSearch = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) throw badRequest('Search query must be at least 2 characters');

  const limit = Math.min(parseInt(String(req.query.limit || 5), 10), 20);

  const [users, communities, posts, events, questions] = await Promise.all([
    User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
      ],
      isBanned: false,
    })
      .select('name username avatar bio skills isVerified')
      .limit(limit),

    Community.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      isPrivate: false,
    })
      .select('name slug description logo memberCount tags')
      .limit(limit),

    Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { hashtags: q.toLowerCase().replace('#', '') },
      ],
    })
      .sort({ trendingScore: -1 })
      .limit(limit)
      .populate('author', 'name username avatar'),

    Event.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      startDate: { $gte: new Date() },
    })
      .limit(limit)
      .populate('host', 'name username avatar'),

    Question.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
      status: { $ne: 'closed' },
    })
      .sort({ trendingScore: -1, helpfulCount: -1 })
      .limit(limit)
      .populate('author', 'name username avatar profession')
      .populate('community', 'name slug'),
  ]);

  const sanitizedQuestions = questions.map((question) => {
    const obj = question.toObject() as unknown as Record<string, unknown>;
    if (obj.isAnonymous) {
      obj.author = null;
      obj.authorDisplay = 'Anonymous';
    }
    return obj;
  });

  sendSuccess(res, { users, communities, posts, events, questions: sanitizedQuestions, query: q });
};

export const searchSkills = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim();
  if (!q) throw badRequest('Skill query required');

  const users = await User.find({ skills: { $regex: q, $options: 'i' }, isBanned: false })
    .select('name username avatar skills')
    .limit(20);

  sendSuccess(res, { users });
};

export const searchHashtags = async (req: Request, res: Response): Promise<void> => {
  const tag = (req.query.tag as string)?.replace('#', '').toLowerCase();
  if (!tag) throw badRequest('Hashtag required');

  const posts = await Post.find({ hashtags: tag })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'name username avatar');

  sendSuccess(res, { posts, hashtag: tag });
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim();
  if (!q) throw badRequest('Query required');

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } },
    ],
    isBanned: false,
  })
    .select('name username avatar bio isVerified')
    .limit(20);

  sendSuccess(res, { users });
};
