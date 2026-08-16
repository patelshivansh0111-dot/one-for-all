import { Router } from 'express';
import { body } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as communityController from '../controllers/community.controller';

const router = Router();

router.get('/', asyncHandler(communityController.listCommunities));
router.get('/:slug', optionalAuth, asyncHandler(communityController.getCommunityBySlug));
router.get('/:slug/members', asyncHandler(communityController.getMembers));
router.get('/:slug/posts', asyncHandler(communityController.getCommunityPosts));

router.use(protect);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
  ]),
  asyncHandler(communityController.createCommunity)
);

router.post('/:slug/join', asyncHandler(communityController.joinCommunity));
router.delete('/:slug/leave', asyncHandler(communityController.leaveCommunity));
router.put('/:slug', asyncHandler(communityController.updateCommunity));
router.put('/:slug/members/role', validate([body('userId').notEmpty(), body('role').isIn(['member', 'moderator', 'admin'])]), asyncHandler(communityController.updateMemberRole));
router.post('/:slug/pin/:postId', asyncHandler(communityController.pinPost));
router.post('/:slug/announcements', validate([body('title').notEmpty(), body('content').notEmpty()]), asyncHandler(communityController.createAnnouncement));
router.post('/:slug/invite/regenerate', asyncHandler(communityController.regenerateInvite));

export default router;
