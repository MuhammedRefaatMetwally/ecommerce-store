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
/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products (Public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of featured products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/featured', getFeaturedProducts);

/**
 * @swagger
 * /api/products/recommendations:
 *   get:
 *     summary: Get recommended products (Public)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 3
 *         description: Number of recommendations
 *     responses:
 *       200:
 *         description: Random recommended products
 */
router.get('/recommendations', getRecommendedProducts);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category (Public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [electronics, clothing, food, books, home, sports, toys, other]
 *     responses:
 *       200:
 *         description: Products in category
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID (Public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Admin access required
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
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
 *         description: Product deleted
 *       403:
 *         description: Admin access required
 */
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

/**
 * @swagger
 * /api/products/{id}/featured:
 *   patch:
 *     summary: Toggle product featured status (Admin only)
 *     tags: [Products]
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
 *         description: Featured status toggled
 *       403:
 *         description: Admin access required
 */
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
