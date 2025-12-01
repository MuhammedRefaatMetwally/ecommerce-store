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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filters (Admin only)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [electronics, clothing, food, books, home, sports, toys, other]
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, category]
 * properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, food, books, home, sports, toys, other]
 *               image:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created
 */
router.get(
  '/',
  protectRoute,
  adminRoute,
  validate(productFilterSchema, 'query'),
  getAllProducts
);

router.post(
  '/',
  protectRoute,
  adminRoute,
  validate(createProductSchema, 'body'),
  createProduct
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
 *       200: { description: Product details }
 *       404: { description: Product not found }
 */
router.get('/:id', validate(productIdSchema, 'params'), getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product (Admin only)
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
 * content:
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
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product permanently (Admin only)
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
 */
router.put(
  '/:id',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  validate(updateProductSchema, 'body'),
  updateProduct
);

router.delete(
  '/:id',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  deleteProduct
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
 */
router.patch(
  '/:id/featured',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  toggleFeaturedProduct
);

export default router;
