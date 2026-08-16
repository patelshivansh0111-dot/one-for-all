import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as messageController from '../controllers/message.controller';

const router = Router();

router.use(protect);

router.get('/conversations', asyncHandler(messageController.getConversations));
router.get('/:conversationId', asyncHandler(messageController.getMessages));
router.post(
  '/:conversationId',
  validate([body('content').notEmpty()]),
  asyncHandler(messageController.sendMessage)
);
router.post('/dm', validate([body('userId').notEmpty()]), asyncHandler(messageController.createDM));
router.post('/group', validate([body('name').notEmpty(), body('participantIds').isArray()]), asyncHandler(messageController.createGroup));
router.put('/:conversationId/seen', asyncHandler(messageController.markSeen));
router.post('/:messageId/reaction', validate([body('emoji').notEmpty()]), asyncHandler(messageController.addReaction));

export default router;
