import { Request, Response } from 'express';
import Answer from '../models/Answer';
import Question from '../models/Question';
import User from '../models/User';
import Like from '../models/Like';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';
import { moderateContent } from '../utils/moderation';
import { calculateQuestionTrendingScore } from '../utils/aiMatching';

const AUTHOR_FIELDS = 'name username avatar profession headline badges peopleHelped questionsAnswered communityRating verifiedExperience';

export const createAnswer = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { questionId, content } = req.body;

  if (!questionId) throw badRequest('questionId is required');
  if (!content?.trim()) throw badRequest('Content is required');

  const question = await Question.findById(questionId);
  if (!question) throw notFound('Question not found');
  if (question.status === 'closed') throw badRequest('Question is closed');

  const moderation = moderateContent(content);
  if (moderation.action === 'block') {
    throw badRequest(`Content blocked: ${moderation.reasons.join(', ')}`);
  }

  const answer = await Answer.create({
    question: questionId,
    author: authReq.user!._id,
    content: content.trim(),
  });

  const wasFirstAnswer = question.answersCount === 0;
  question.answersCount += 1;
  if (question.status === 'open') question.status = 'answered';
  question.trendingScore = calculateQuestionTrendingScore(
    question.helpfulCount,
    question.answersCount,
    question.savesCount,
    question.viewsCount,
    question.createdAt
  );
  await question.save();

  await User.findByIdAndUpdate(authReq.user!._id, {
    $inc: { questionsAnswered: 1, topicsCount: wasFirstAnswer ? 1 : 0 },
  });

  const populated = await answer.populate('author', AUTHOR_FIELDS);
  sendSuccess(res, { answer: populated }, 'Answer created', 201);
};

export const getAnswers = async (req: Request, res: Response): Promise<void> => {
  const questionId = req.query.questionId as string;
  if (!questionId) throw badRequest('questionId query parameter is required');

  const question = await Question.findById(questionId);
  if (!question) throw notFound('Question not found');

  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);

  const [answers, total] = await Promise.all([
    Answer.find({ question: questionId })
      .sort({ isBestAnswer: -1, helpfulCount: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS),
    Answer.countDocuments({ question: questionId }),
  ]);

  sendSuccess(res, { answers, pagination: { page, limit, total } });
};

export const markAnswerHelpful = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const answerId = String(req.params.id);
  const answer = await Answer.findById(answerId);
  if (!answer) throw notFound('Answer not found');

  const existing = await Like.findOne({
    user: authReq.user!._id,
    targetType: 'answer',
    targetId: answerId,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    answer.helpfulCount = Math.max(0, answer.helpfulCount - 1);
    await answer.save();
    await User.findByIdAndUpdate(answer.author, { $inc: { peopleHelped: -1 } });
    sendSuccess(res, { helpful: false, helpfulCount: answer.helpfulCount }, 'Helpful removed');
    return;
  }

  await Like.create({
    user: authReq.user!._id,
    targetType: 'answer',
    targetId: answerId,
  });
  answer.helpfulCount += 1;
  await answer.save();
  await User.findByIdAndUpdate(answer.author, { $inc: { peopleHelped: 1 } });

  sendSuccess(res, { helpful: true, helpfulCount: answer.helpfulCount }, 'Marked helpful');
};

export const deleteAnswer = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const answer = await Answer.findById(req.params.id);
  if (!answer) throw notFound('Answer not found');

  const isAuthor = answer.author.toString() === authReq.user!._id.toString();
  const isStaff = authReq.user!.role === 'admin' || authReq.user!.role === 'moderator';
  if (!isAuthor && !isStaff) throw forbidden('Not authorized');

  const question = await Question.findById(answer.question);
  if (question) {
    question.answersCount = Math.max(0, question.answersCount - 1);
    if (question.answersCount === 0 && question.status === 'answered') {
      question.status = 'open';
    }
    question.trendingScore = calculateQuestionTrendingScore(
      question.helpfulCount,
      question.answersCount,
      question.savesCount,
      question.viewsCount,
      question.createdAt
    );
    await question.save();
  }

  await Promise.all([
    Like.deleteMany({ targetType: 'answer', targetId: answer._id }),
    Answer.findByIdAndDelete(answer._id),
  ]);

  await User.findByIdAndUpdate(answer.author, { $inc: { questionsAnswered: -1 } });

  sendSuccess(res, undefined, 'Answer deleted');
};
