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

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get user's active coupon
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Active coupon or null
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *   post:
 *     summary: Create coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountPercentage
 *               - expirationDate
 *               - userId
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               discountPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: string
 *               usageLimit:
 *                 type: number
 *                 minimum: 1
 *               minimumPurchase:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Coupon created
 *       403:
 *         description: Admin access required
 */
router.get('/', getUserCoupon);

/**
 * @swagger
 * /api/coupons/my-coupons:
 *   get:
 *     summary: Get all user's coupons
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *     */
router.get('/my-coupons', getAllUserCoupons);

/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Validate coupon code
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               cartTotal:
 *                 type: number
 *                 example: 100.00
 *     responses:
 *       200:
 *         description: Coupon is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     discountPercentage:
 *                       type: number
 *                     discountAmount:
 *                       type: number
 *       400:
 *         description: Invalid coupon
 */
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

/**
 * @swagger
 * /api/coupons/bulk:
 *   post:
 *     summary: Create bulk coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - discountPercentage
 *               - expirationDate
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               discountPercentage:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *               codePrefix:
 *                 type: string
 *                 default: PROMO
 *     responses:
 *       201:
 *         description: Bulk coupons created
 */
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

/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: Delete coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
router.delete(
  '/:id',
  adminRoute,
  validate(couponIdSchema, 'params'),
  deleteCoupon
);

export default router;
