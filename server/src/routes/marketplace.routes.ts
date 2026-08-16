import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as marketplaceController from '../controllers/marketplace.controller';

const router = Router();

router.get('/', asyncHandler(marketplaceController.getListings));
router.get('/seller/me', protect, asyncHandler(marketplaceController.getMyListings));
router.get('/:id', asyncHandler(marketplaceController.getListingById));

router.use(protect);

router.post(
  '/',
  validate([
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('type').isIn(['buy', 'sell', 'exchange', 'service', 'digital', 'freelance', 'hiring']),
    body('category').notEmpty(),
  ]),
  asyncHandler(marketplaceController.createListing)
);

router.put('/:id', asyncHandler(marketplaceController.updateListing));
router.delete('/:id', asyncHandler(marketplaceController.deleteListing));

export default router;
