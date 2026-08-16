import { Router } from 'express';
import { body } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as answerController from '../controllers/answer.controller';

const router = Router();

router.get('/', optionalAuth, asyncHandler(answerController.getAnswers));

router.use(protect);

router.post(
  '/',
  validate([
    body('questionId').notEmpty().withMessage('questionId is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  asyncHandler(answerController.createAnswer)
);

router.post('/:id/helpful', asyncHandler(answerController.markAnswerHelpful));
router.delete('/:id', asyncHandler(answerController.deleteAnswer));

export default router;
