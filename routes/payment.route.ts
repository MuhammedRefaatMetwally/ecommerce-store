import { Router } from 'express';
import {
  createCheckoutSession,
  checkoutSuccess,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/payment.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createCheckoutSchema,
  checkoutSuccessSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.use(protectRoute);

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     image:
 *                       type: string
 *               couponCode:
 *                 type: string
 *                 example: SAVE20
 *     responses:
 *       200:
 *         description: Checkout session created
 */
router.post(
  '/create-checkout-session',
  validate(createCheckoutSchema, 'body'),
  createCheckoutSession
);

/**
 * @swagger
 * /api/payments/checkout-success:
 *   post:
 *     summary: Handle successful checkout
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 */
router.post(
  '/checkout-success',
  validate(checkoutSuccessSchema, 'body'),
  checkoutSuccess
);

/**
 * @swagger
 * /api/payments/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/orders', getUserOrders);

/**
 * @swagger
 * /api/payments/orders/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/orders/all', adminRoute, getAllOrders);

/**
 * @swagger
 * /api/payments/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Payments]
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
 *         description: Order details
 */
router.get('/orders/:id', validate(orderIdSchema, 'params'), getOrderById);

/**
 * @swagger
 * /api/payments/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch(
  '/orders/:id/status',
  adminRoute,
  validate(orderIdSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  updateOrderStatus
);

export default router;