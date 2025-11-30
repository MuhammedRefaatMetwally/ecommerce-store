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

router.post(
  '/create-checkout-session',
  validate(createCheckoutSchema, 'body'),
  createCheckoutSession
);

router.post(
  '/checkout-success',
  validate(checkoutSuccessSchema, 'body'),
  checkoutSuccess
);

router.get('/orders', getUserOrders);

router.get('/orders/all', adminRoute, getAllOrders);

router.get('/orders/:id', validate(orderIdSchema, 'params'), getOrderById);

router.patch(
  '/orders/:id/status',
  adminRoute,
  validate(orderIdSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  updateOrderStatus
);

export default router;
