import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  validateCart
} from '../controllers/cart.controller';
import { protectRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  addToCartSchema,
  updateQuantitySchema,
  productIdParamSchema
} from '../validators/cart.validator';

const router = Router();

router.use(protectRoute);

router.get('/', getCart);

router.get('/validate', validateCart);


router.post(
  '/',
  validate(addToCartSchema, 'body'),
  addToCart
);

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