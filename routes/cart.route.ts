import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  validateCart,
} from '../controllers/cart.controller';
import { protectRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  addToCartSchema,
  updateQuantitySchema,
  productIdParamSchema,
} from '../validators/cart.validator';

const router = Router();

router.use(protectRoute);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart with items and totals
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 */
router.get('/', getCart);
router.post('/', validate(addToCartSchema, 'body'), addToCart);
router.delete('/', clearCart);

/**
 * @swagger
 * /api/cart/validate:
 *   get:
 *     summary: Validate cart items
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 */
router.get('/validate', validateCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 */
router.put(
  '/:productId',
  validate(productIdParamSchema, 'params'),
  validate(updateQuantitySchema, 'body'),
  updateCartItemQuantity
);

router.delete(
  '/:productId',
  validate(productIdParamSchema, 'params'),
  removeFromCart
);

export default router;