import { Router } from 'express';
import { body } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as postController from '../controllers/post.controller';

const router = Router();

router.get('/feed', optionalAuth, asyncHandler(postController.getFeed));
router.get('/trending', asyncHandler(postController.getTrending));
router.get('/:id', optionalAuth, asyncHandler(postController.getPostById));

router.use(protect);

router.post(
  '/',
  validate([
    body('content').notEmpty().withMessage('Content is required'),
    body('type').optional().isIn(['text', 'image', 'video', 'poll', 'document', 'code', 'question', 'link']),
  ]),
  asyncHandler(postController.createPost)
);

router.put('/:id', asyncHandler(postController.updatePost));
router.delete('/:id', asyncHandler(postController.deletePost));
router.post('/:id/like', asyncHandler(postController.likePost));
router.post('/:id/bookmark', asyncHandler(postController.bookmarkPost));
router.post('/:id/share', asyncHandler(postController.sharePost));
router.post(
  '/:id/report',
  validate([body('reason').notEmpty()]),
  asyncHandler(postController.reportPost)
);
router.post('/:id/vote', validate([body('optionIndex').isInt({ min: 0 })]), asyncHandler(postController.votePoll));

export default router;
