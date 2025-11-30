import { Router } from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeaturedProduct,
  getProductsByCategory,
  getRecommendedProducts,
} from '../controllers/product.controller';
import { protectRoute, adminRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  categoryParamSchema,
  productFilterSchema,
} from '../validators/product.validator';

const router = Router();

router.get('/featured', getFeaturedProducts);

router.get('/recommendations', getRecommendedProducts);

router.get(
  '/category/:category',
  validate(categoryParamSchema, 'params'),
  getProductsByCategory
);

// Protected routes (Admin only)
router.get(
  '/',
  protectRoute,
  adminRoute,
  validate(productFilterSchema, 'query'),
  getAllProducts
);

router.get('/:id', validate(productIdSchema, 'params'), getProductById);

router.post(
  '/',
  protectRoute,
  adminRoute,
  validate(createProductSchema, 'body'),
  createProduct
);

router.put(
  '/:id',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  validate(updateProductSchema, 'body'),
  updateProduct
);

router.patch(
  '/:id/featured',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  toggleFeaturedProduct
);

router.delete(
  '/:id',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  deleteProduct
);

export default router;
