import { Router } from 'express';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import * as achievementController from '../controllers/achievement.controller';

const router = Router();

router.get('/', asyncHandler(achievementController.listAchievements));
router.get('/leaderboard', asyncHandler(achievementController.getLeaderboardHandler));

router.use(protect);

router.get('/me', asyncHandler(achievementController.getMyAchievements));
router.post('/check', asyncHandler(achievementController.checkAchievements));

export default router;
