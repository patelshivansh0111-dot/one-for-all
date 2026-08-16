import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.use(protect);

router.post('/summarize/post/:postId', asyncHandler(aiController.summarizePost));
router.post('/summarize', validate([body('text').notEmpty()]), asyncHandler(aiController.summarizeContent));
router.get('/recommend/communities', asyncHandler(aiController.recommendCommunities));
router.get('/recommend/friends', asyncHandler(aiController.recommendFriends));
router.post('/generate/rules', validate([body('name').notEmpty()]), asyncHandler(aiController.generateRules));
router.post('/generate/event-description', asyncHandler(aiController.generateEventDesc));
router.post('/suggest/hashtags', validate([body('content').notEmpty()]), asyncHandler(aiController.suggestTags));
router.post('/moderate', validate([body('text').notEmpty()]), asyncHandler(aiController.moderateText));
router.post(
  '/match-people',
  validate([body('question').notEmpty()]),
  asyncHandler(aiController.matchPeople)
);
router.post(
  '/analyze-question',
  validate([body('question').notEmpty()]),
  asyncHandler(aiController.analyzeQuestionText)
);

export default router;
