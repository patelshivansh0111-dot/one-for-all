import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadAvatar as avatarUpload } from '../middleware/upload';
import { asyncHandler } from '../utils/helpers';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/', asyncHandler(userController.listPeople));
router.get('/profile/:username', asyncHandler(userController.getProfile));

router.use(protect);

router.put(
  '/profile',
  validate([body('name').optional().trim().notEmpty()]),
  asyncHandler(userController.updateProfile)
);

router.post('/follow/:userId', asyncHandler(userController.followUser));
router.delete('/follow/:userId', asyncHandler(userController.unfollowUser));
router.get('/:username/followers', asyncHandler(userController.getFollowers));
router.get('/:username/following', asyncHandler(userController.getFollowing));

router.post('/avatar', avatarUpload.single('avatar'), asyncHandler(userController.uploadAvatar));
router.post('/cover', avatarUpload.single('cover'), asyncHandler(userController.uploadCover));

router.post('/block/:userId', asyncHandler(userController.blockUser));
router.get('/dashboard/stats', asyncHandler(userController.getDashboardStats));
router.delete('/account', asyncHandler(userController.deleteAccount));
router.get('/export', asyncHandler(userController.exportData));

export default router;
