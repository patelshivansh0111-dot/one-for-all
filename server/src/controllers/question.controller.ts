import { Request, Response } from 'express';
import Question from '../models/Question';
import SavedQuestion from '../models/SavedQuestion';
import Like from '../models/Like';
import Report from '../models/Report';
import Answer from '../models/Answer';
import { AuthRequest } from '../types/express';
import {
  sendSuccess,
  paginateQuery,
} from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';
import { moderateContent } from '../utils/moderation';
import {
  analyzeQuestion,
  calculateQuestionTrendingScore,
} from '../utils/aiMatching';
import { QUESTION_CATEGORIES } from '../constants/questionCategories';

const PUBLIC_AUTHOR_FIELDS = 'name username avatar profession headline badges peopleHelped communityRating verifiedExperience';

const sanitizeQuestion = (
  question: { toObject?: () => Record<string, unknown> } | Record<string, unknown>,
  viewerId?: string
): Record<string, unknown> => {
  const q =
    typeof (question as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (question as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(question as Record<string, unknown>) };

  const author = q.author as Record<string, unknown> | undefined;
  const authorId =
    author?._id?.toString?.() ??
    (typeof q.author === 'object' && q.author !== null && 'toString' in (q.author as object)
      ? (q.author as { toString: () => string }).toString()
      : undefined);
  const isOwner = Boolean(viewerId && authorId && authorId === viewerId);

  if (q.isAnonymous && !isOwner) {
    q.author = null;
    q.authorDisplay = 'Anonymous';
  }

  return q;
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { content, isAnonymous, category, tags, community, location } = req.body;

  if (!content?.trim()) throw badRequest('Content is required');

  const moderation = moderateContent(content);
  if (moderation.action === 'block') {
    throw badRequest(`Content blocked: ${moderation.reasons.join(', ')}`);
  }

  let resolvedCategory = category;
  if (!resolvedCategory || !QUESTION_CATEGORIES.includes(resolvedCategory)) {
    resolvedCategory = analyzeQuestion(content).suggestedCategory;
  }

  const normalizedTags = [
    ...new Set((tags || []).map((t: string) => t.toLowerCase().trim()).filter(Boolean)),
  ] as string[];

  const question = await Question.create({
    author: authReq.user!._id,
    content: content.trim(),
    isAnonymous: Boolean(isAnonymous),
    category: resolvedCategory,
    tags: normalizedTags,
    community: community || undefined,
    location: location?.trim() || undefined,
    trendingScore: 0,
  });

  const populated = await Question.findById(question._id)
    .populate('author', PUBLIC_AUTHOR_FIELDS);
  sendSuccess(
    res,
    { question: sanitizeQuestion(populated!, authReq.user!._id.toString()) },
    'Question created',
    201
  );
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);

  const filter: Record<string, unknown> = { status: { $ne: 'closed' } };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.community) filter.community = req.query.community;
  if (req.query.tag) filter.tags = (req.query.tag as string).toLowerCase();
  if (req.query.status) filter.status = req.query.status;

  const sortBy: Record<string, 1 | -1> =
    req.query.sort === 'helpful' ? { helpfulCount: -1 } : { createdAt: -1 };

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('author', PUBLIC_AUTHOR_FIELDS)
      .populate('community', 'name slug logo'),
    Question.countDocuments(filter),
  ]);

  const viewerId = authReq.user?._id?.toString();
  sendSuccess(res, {
    questions: questions.map((q) => sanitizeQuestion(q.toObject(), viewerId)),
    pagination: { page, limit, total },
  });
};

export const getTrendingQuestions = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { limit } = paginateQuery(1, req.query.limit as string);

  const questions = await Question.find({ status: { $ne: 'closed' } })
    .sort({ trendingScore: -1, helpfulCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('author', PUBLIC_AUTHOR_FIELDS)
    .populate('community', 'name slug logo');

  const viewerId = authReq.user?._id?.toString();
  sendSuccess(res, {
    questions: questions.map((q) => sanitizeQuestion(q.toObject(), viewerId)),
  });
};

export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const question = await Question.findById(req.params.id)
    .populate('author', PUBLIC_AUTHOR_FIELDS)
    .populate('community', 'name slug logo');

  if (!question) throw notFound('Question not found');

  await Question.findByIdAndUpdate(question._id, { $inc: { viewsCount: 1 } });
  question.viewsCount += 1;

  const viewerId = authReq.user?._id?.toString();
  let saved = false;
  let markedHelpful = false;

  if (authReq.user) {
    const [savedDoc, helpfulDoc] = await Promise.all([
      SavedQuestion.findOne({ user: authReq.user._id, question: question._id }),
      Like.findOne({
        user: authReq.user._id,
        targetType: 'question',
        targetId: question._id,
      }),
    ]);
    saved = Boolean(savedDoc);
    markedHelpful = Boolean(helpfulDoc);
  }

  sendSuccess(res, {
    question: sanitizeQuestion(question.toObject(), viewerId),
    saved,
    markedHelpful,
  });
};

export const markQuestionHelpful = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const questionId = String(req.params.id);
  const question = await Question.findById(questionId);
  if (!question) throw notFound('Question not found');

  const existing = await Like.findOne({
    user: authReq.user!._id,
    targetType: 'question',
    targetId: questionId,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    question.helpfulCount = Math.max(0, question.helpfulCount - 1);
    question.trendingScore = calculateQuestionTrendingScore(
      question.helpfulCount,
      question.answersCount,
      question.savesCount,
      question.viewsCount,
      question.createdAt
    );
    await question.save();
    sendSuccess(res, { helpful: false, helpfulCount: question.helpfulCount }, 'Helpful removed');
    return;
  }

  await Like.create({
    user: authReq.user!._id,
    targetType: 'question',
    targetId: questionId,
  });
  question.helpfulCount += 1;
  question.trendingScore = calculateQuestionTrendingScore(
    question.helpfulCount,
    question.answersCount,
    question.savesCount,
    question.viewsCount,
    question.createdAt
  );
  await question.save();
  sendSuccess(res, { helpful: true, helpfulCount: question.helpfulCount }, 'Marked helpful');
};

export const saveQuestion = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const questionId = String(req.params.id);
  const question = await Question.findById(questionId);
  if (!question) throw notFound('Question not found');

  const existing = await SavedQuestion.findOne({
    user: authReq.user!._id,
    question: questionId,
  });

  if (existing) {
    await SavedQuestion.deleteOne({ _id: existing._id });
    question.savesCount = Math.max(0, question.savesCount - 1);
    await question.save();
    sendSuccess(res, { saved: false, savesCount: question.savesCount }, 'Question unsaved');
    return;
  }

  await SavedQuestion.create({ user: authReq.user!._id, question: questionId });
  question.savesCount += 1;
  question.trendingScore = calculateQuestionTrendingScore(
    question.helpfulCount,
    question.answersCount,
    question.savesCount,
    question.viewsCount,
    question.createdAt
  );
  await question.save();
  sendSuccess(res, { saved: true, savesCount: question.savesCount }, 'Question saved');
};

export const reportQuestion = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const question = await Question.findById(req.params.id);
  if (!question) throw notFound('Question not found');
  if (!req.body.reason) throw badRequest('Reason is required');

  await Report.create({
    reporter: authReq.user!._id,
    targetType: 'question',
    targetId: question._id,
    reason: req.body.reason,
    details: req.body.details,
  });

  question.isReported = true;
  await question.save();
  sendSuccess(res, undefined, 'Report submitted');
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const question = await Question.findById(req.params.id);
  if (!question) throw notFound('Question not found');

  const isAuthor = question.author.toString() === authReq.user!._id.toString();
  const isStaff = authReq.user!.role === 'admin' || authReq.user!.role === 'moderator';
  if (!isAuthor && !isStaff) throw forbidden('Not authorized');

  await Promise.all([
    Answer.deleteMany({ question: question._id }),
    SavedQuestion.deleteMany({ question: question._id }),
    Like.deleteMany({ targetType: 'question', targetId: question._id }),
    Question.findByIdAndDelete(question._id),
  ]);

  sendSuccess(res, undefined, 'Question deleted');
};
