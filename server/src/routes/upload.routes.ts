import { Router } from 'express';
import { protect } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import { uploadImage as imageUpload, uploadVideo as videoUpload } from '../middleware/upload';
import { asyncHandler } from '../utils/helpers';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

router.use(protect);
router.use(uploadLimiter);

router.post('/image', imageUpload.single('file'), asyncHandler(uploadController.uploadImage));
router.post('/video', videoUpload.single('file'), asyncHandler(uploadController.uploadVideo));
router.post('/multiple', imageUpload.array('files', 10), asyncHandler(uploadController.uploadMultiple));

export default router;
