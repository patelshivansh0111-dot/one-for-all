import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import Like from '../models/Like';
import Notification from '../models/Notification';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, forbidden, badRequest } from '../utils/apiError';
import { moderateContent } from '../utils/moderation';
import { addXP, checkAndAwardAchievements } from '../utils/gamification';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const post = await Post.findById(req.params.postId);
  if (!post) throw notFound('Post not found');

  const moderation = moderateContent(req.body.content);
  if (moderation.action === 'block') {
    throw badRequest(`Content blocked: ${moderation.reasons.join(', ')}`);
  }

  const comment = await Comment.create({
    post: post._id,
    author: authReq.user!._id,
    content: req.body.content,
    parentComment: req.body.parentComment || null,
  });

  post.commentsCount += 1;
  post.trendingScore += 5;
  await post.save();

  if (req.body.parentComment) {
    await Comment.findByIdAndUpdate(req.body.parentComment, { $inc: { repliesCount: 1 } });
  }

  await addXP(authReq.user!._id, 5);
  await checkAndAwardAchievements(authReq.user!._id);

  if (post.author.toString() !== authReq.user!._id.toString()) {
    await Notification.create({
      recipient: post.author,
      sender: authReq.user!._id,
      type: 'comment',
      title: 'New Comment',
      body: `${authReq.user!.name} commented on your post`,
      link: `/posts/${post._id}`,
    });
  }

  const populated = await comment.populate('author', 'name username avatar');
  sendSuccess(res, { comment: populated }, 'Comment created', 201);
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);

  const comments = await Comment.find({
    post: req.params.postId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name username avatar');

  const commentIds = comments.map((c) => c._id);
  const replies = await Comment.find({ parentComment: { $in: commentIds } })
    .sort({ createdAt: 1 })
    .populate('author', 'name username avatar');

  const repliesMap = new Map<string, typeof replies>();
  for (const reply of replies) {
    const key = reply.parentComment!.toString();
    if (!repliesMap.has(key)) repliesMap.set(key, []);
    repliesMap.get(key)!.push(reply);
  }

  const commentsWithReplies = comments.map((c) => ({
    ...c.toObject(),
    replies: repliesMap.get(c._id.toString()) || [],
  }));

  sendSuccess(res, { comments: commentsWithReplies });
};

export const likeComment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw notFound('Comment not found');

  const existing = await Like.findOne({
    user: authReq.user!._id,
    targetType: 'comment',
    targetId: comment._id,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await comment.save();
    sendSuccess(res, { liked: false });
    return;
  }

  await Like.create({
    user: authReq.user!._id,
    targetType: 'comment',
    targetId: comment._id,
  });
  comment.likesCount += 1;
  await comment.save();
  sendSuccess(res, { liked: true });
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw notFound('Comment not found');

  const isAuthor = comment.author.toString() === authReq.user!._id.toString();
  const isMod = authReq.user!.role === 'admin' || authReq.user!.role === 'moderator';
  if (!isAuthor && !isMod) throw forbidden('Not authorized');

  await Comment.deleteMany({ parentComment: comment._id });
  await Like.deleteMany({ targetType: 'comment', targetId: comment._id });
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
  }

  await comment.deleteOne();
  sendSuccess(res, undefined, 'Comment deleted');
};
