import { Router } from 'express';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', asyncHandler(notificationController.getNotifications));
router.put('/:id/read', asyncHandler(notificationController.markAsRead));
router.put('/read-all', asyncHandler(notificationController.markAllAsRead));
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

export default router;
