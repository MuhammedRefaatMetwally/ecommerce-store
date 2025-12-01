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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 minimum: 1
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Product added to cart
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.get('/', getCart);


/**
 * @swagger
 * /api/cart/validate:
 *   get:
 *     summary: Validate cart items
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/validate', validateCart);

router.post('/', validate(addToCartSchema, 'body'), addToCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Set to 0 to remove item
 *     responses:
 *       200:
 *         description: Quantity updated
 *       404:
 *         description: Product not in cart
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed
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

router.delete('/', clearCart);

export default router;
