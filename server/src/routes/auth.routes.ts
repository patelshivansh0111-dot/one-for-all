import { Router } from 'express';
import { body } from 'express-validator';
import passport from '../config/passport';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import { isGoogleOAuthConfigured } from '../config/env';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Invalid username'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  asyncHandler(authController.login)
);

router.post('/logout', asyncHandler(authController.logout));

router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password',
  authLimiter,
  validate([
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ]),
  asyncHandler(authController.resetPassword)
);

router.get('/verify-email/:token', asyncHandler(authController.verifyEmail));

if (isGoogleOAuthConfigured()) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(authController.googleCallback)
  );
}

router.get('/me', protect, asyncHandler(authController.getMe));
router.post('/refresh', asyncHandler(authController.refresh));

export default router;
