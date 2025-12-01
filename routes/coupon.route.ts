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
/**
 * @swagger
 * /api/coupons/all:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all coupons with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Coupon'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   code: "SAVE20"
 *                   discountPercentage: 20
 *                   user:
 *                     fullName: "John Doe"
 *                     email: "john@example.com"
 *       403:
 *         description: Admin access required*/
router.get('/all', adminRoute, getAllCoupons);

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon (Admin only)
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
 *                 pattern: '^[A-Z0-9]+$'
 *                 minLength: 3
 *                 maxLength: 20
 *                 example: SAVE20
 *                 description: Coupon code (uppercase letters and numbers only)
 *               discountPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *                 description: Discount percentage (0-100)
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *                 description: Must be in the future
 *               userId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 example: 507f1f77bcf86cd799439011
 *                 description: User MongoDB ObjectId
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *                 description: Maximum number of times coupon can be used
 *               minimumPurchase:
 *                 type: number
 *                 minimum: 0
 *                 example: 50
 *                 description: Minimum purchase amount required
 *           examples:
 *             welcome:
 *               summary: Welcome coupon (one-time use)
 *               value:
 *                 code: "WELCOME50"
 *                 discountPercentage: 50
 *                 expirationDate: "2024-12-31T23:59:59Z"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 usageLimit: 1
 *                 minimumPurchase: 0
 *             loyalty:
 *               summary: Loyalty reward (multiple uses)
 *               value:
 *                 code: "VIP20"
 *                 discountPercentage: 20
 *                 expirationDate: "2024-12-31T23:59:59Z"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 usageLimit: 10
 *                 minimumPurchase: 100
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Validation error or code already exists
 *       403:
 *         description: Admin access required*/
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

/**
 * @swagger
 * /api/coupons/cleanup:
 *   post:
 *     summary: Deactivate all expired coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     description: Finds all coupons with expiration date in the past and sets isActive to false
 *     responses:
 *       200:
 *         description: Expired coupons deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 15 expired coupons deactivated
 *                 count:
 *                   type: number
 *                   example: 15
 *                   description: Number of coupons deactivated
 *       403:
 *         description: Admin access required
 */
router.post('/cleanup', adminRoute, cleanupExpiredCoupons);

/**
 * @swagger
 * /api/coupons/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a specific coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Coupon MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Coupon deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon deactivated successfully
 *       404:
 *         description: Coupon not found
 *       403:
 *         description: Admin access required
 */
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
