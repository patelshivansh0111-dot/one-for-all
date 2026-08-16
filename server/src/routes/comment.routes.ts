import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as commentController from '../controllers/comment.controller';

const router = Router();

router.get('/post/:postId', asyncHandler(commentController.getComments));

router.use(protect);

router.post(
  '/post/:postId',
  validate([body('content').notEmpty().trim()]),
  asyncHandler(commentController.createComment)
);

router.post('/:id/like', asyncHandler(commentController.likeComment));
router.delete('/:id', asyncHandler(commentController.deleteComment));

export default router;
