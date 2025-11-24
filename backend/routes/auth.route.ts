import { Router } from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/auth.controller';
import { protectRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post(
  '/signup',
  validate(signupSchema, 'body'),
  signup
);

router.post(
  '/login',
  validate(loginSchema, 'body'),
  login
);

router.post(
  '/refresh-token',
  refreshToken
);

// Protected routes
router.post(
  '/logout',
  protectRoute,
  logout
);

router.get(
  '/profile',
  protectRoute,
  getProfile
);

router.put(
  '/profile',
  protectRoute,
  validate(updateProfileSchema, 'body'),
  updateProfile
);

router.post(
  '/change-password',
  protectRoute,
  validate(changePasswordSchema, 'body'),
  changePassword
);

export default router;