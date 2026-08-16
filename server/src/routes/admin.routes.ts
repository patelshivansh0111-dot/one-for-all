import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireAdmin, requireModerator } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(protect);
router.use(requireModerator);

router.get('/analytics', requireAdmin, asyncHandler(adminController.getAnalytics));
router.get('/users', requireAdmin, asyncHandler(adminController.getUsers));
router.put('/users/:userId/ban', requireAdmin, validate([body('reason').optional()]), asyncHandler(adminController.banUser));
router.put('/users/:userId/unban', requireAdmin, asyncHandler(adminController.unbanUser));
router.put('/users/:userId/role', requireAdmin, validate([body('role').isIn(['user', 'moderator', 'admin'])]), asyncHandler(adminController.updateUserRole));

router.get('/reports', asyncHandler(adminController.getReports));
router.put('/reports/:id', validate([body('status').isIn(['pending', 'reviewed', 'resolved', 'dismissed'])]), asyncHandler(adminController.reviewReport));

router.get('/communities', asyncHandler(adminController.getCommunities));
router.delete('/communities/:id', requireAdmin, asyncHandler(adminController.deleteCommunity));

export default router;
