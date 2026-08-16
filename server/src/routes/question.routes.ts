import { Router } from 'express';
import { body } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as questionController from '../controllers/question.controller';
import { QUESTION_CATEGORIES } from '../constants/questionCategories';

const router = Router();

router.get('/', optionalAuth, asyncHandler(questionController.getQuestions));
router.get('/trending', optionalAuth, asyncHandler(questionController.getTrendingQuestions));
router.get('/:id', optionalAuth, asyncHandler(questionController.getQuestionById));

router.use(protect);

router.post(
  '/',
  validate([
    body('content').notEmpty().withMessage('Content is required'),
    body('category').optional().isIn([...QUESTION_CATEGORIES]),
    body('isAnonymous').optional().isBoolean(),
  ]),
  asyncHandler(questionController.createQuestion)
);

router.post('/:id/helpful', asyncHandler(questionController.markQuestionHelpful));
router.post('/:id/save', asyncHandler(questionController.saveQuestion));
router.post(
  '/:id/report',
  validate([body('reason').notEmpty()]),
  asyncHandler(questionController.reportQuestion)
);
router.delete('/:id', asyncHandler(questionController.deleteQuestion));

export default router;
