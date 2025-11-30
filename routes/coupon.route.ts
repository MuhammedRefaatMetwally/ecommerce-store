import { Router } from 'express';
import {
  getUserCoupon,
  getAllUserCoupons,
  validateCoupon,
  createCoupon,
  getAllCoupons,
  deactivateCoupon,
  deleteCoupon,
  createBulkCoupons,
  cleanupExpiredCoupons,
} from '../controllers/coupon.controller';
import { protectRoute, adminRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCouponSchema,
  validateCouponSchema,
  bulkCouponSchema,
  couponIdSchema,
} from '../validators/coupon.validator';

const router = Router();

router.use(protectRoute);

router.get('/', getUserCoupon);

router.get('/my-coupons', getAllUserCoupons);

router.post(
  '/validate',
  validate(validateCouponSchema, 'body'),
  validateCoupon
);

router.get('/all', adminRoute, getAllCoupons);

router.post(
  '/',
  adminRoute,
  validate(createCouponSchema, 'body'),
  createCoupon
);

router.post(
  '/bulk',
  adminRoute,
  validate(bulkCouponSchema, 'body'),
  createBulkCoupons
);

router.post('/cleanup', adminRoute, cleanupExpiredCoupons);

router.patch(
  '/:id/deactivate',
  adminRoute,
  validate(couponIdSchema, 'params'),
  deactivateCoupon
);

router.delete(
  '/:id',
  adminRoute,
  validate(couponIdSchema, 'params'),
  deleteCoupon
);

export default router;
