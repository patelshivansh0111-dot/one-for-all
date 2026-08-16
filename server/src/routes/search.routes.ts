import { Router } from 'express';
import { asyncHandler } from '../utils/helpers';
import * as searchController from '../controllers/search.controller';

const router = Router();

router.get('/', asyncHandler(searchController.unifiedSearch));
router.get('/users', asyncHandler(searchController.searchUsers));
router.get('/skills', asyncHandler(searchController.searchSkills));
router.get('/hashtags', asyncHandler(searchController.searchHashtags));

export default router;
