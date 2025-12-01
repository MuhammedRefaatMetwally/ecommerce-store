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
 *         description: Filter by category
 *         example: electronics
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *         example: true
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *         example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *         example: 1000
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of products matching filters
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
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *             examples:
 *               filtered:
 *                 summary: Filtered products example
 *                 value:
 *                   success: true
 *                   count: 5
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       name: "iPhone 15 Pro"
 *                       price: 999.99
 *                       category: "electronics"
 *                       isFeatured: true
 *       401:
 *         description: Unauthorized - No access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: iPhone 15 Pro
 *                 description: Product name (3-100 characters)
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: Latest flagship smartphone with A17 Pro chip, titanium design, and advanced camera system
 *                 description: Product description (10-2000 characters)
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 999.99
 *                 description: Product price (must be positive)
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://res.cloudinary.com/demo/image/upload/v1234567890/products/iphone15.jpg
 *                 description: Product image URL or base64 encoded image
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, food, books, home, sports, toys, other]
 *                 example: electronics
 *                 description: Product category
 *           examples:
 *             electronics:
 *               summary: Electronics product
 *               value:
 *                 name: "iPhone 15 Pro"
 *                 description: "Latest flagship smartphone with A17 Pro chip"
 *                 price: 999.99
 *                 image: "https://example.com/iphone15.jpg"
 *                 category: "electronics"
 *             clothing:
 *               summary: Clothing product
 *               value:
 *                 name: "Premium Cotton T-Shirt"
 *                 description: "High-quality 100% cotton t-shirt"
 *                 price: 29.99
 *                 image: "https://example.com/tshirt.jpg"
 *                 category: "clothing"
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Product created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Validation failed
 *               errors:
 *                 - field: price
 *                   message: Price must be greater than 0
 *       403:
 *  */
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
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Product MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: iPhone 15 Pro Max
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: Updated description with new features
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 1099.99
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/updated-image.jpg
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, food, books, home, sports, toys, other]
 *                 example: electronics
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *             description: At least one field must be provided for update
 *           examples:
 *             priceUpdate:
 *               summary: Update only price
 *               value:
 *                 price: 899.99
 *             fullUpdate:
 *               summary: Update multiple fields
 *               value:
 *                 name: "iPhone 15 Pro - Special Edition"
 *                 price: 1199.99
 *                 isFeatured: true
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Product updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or no fields provided
 *       404:
 *         description: Product not found
 *       403:
 *         description: Admin access required
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Product MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product deleted successfully (also deletes image from Cloudinary)
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
 *                   example: Product deleted successfully
 *                 data:
 *                   type: null
 *                   example: null
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Product not found
 *       403:
 *         description: Admin access required **/
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
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Product MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Featured status toggled and cache updated
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
 *                   example: Product featured successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *             examples:
 *               featured:
 *                 summary: Product marked as featured
 *                 value:
 *                   success: true
 *                   message: "Product featured successfully"
 *                   data:
 *                     id: "507f1f77bcf86cd799439011"
 *                     name: "iPhone 15 Pro"
 *                     isFeatured: true
 *               unfeatured:
 *                 summary: Product unmarked as featured
 *                 value:
 *                   success: true
 *                   message: "Product unfeatured successfully"
 *                   data:
 *                     id: "507f1f77bcf86cd799439011"
 *                     name: "iPhone 15 Pro"
 *                     isFeatured: false
 *       404:
 *         description: Product not found
 *       403:
 *         description: Admin access required*/
router.patch(
  '/:id/featured',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  toggleFeaturedProduct
);


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product permanently (Admin only)
 *     description: |
 *       Permanently deletes a product from the database and removes its associated image from Cloudinary.
 *       This action cannot be undone. Only administrators can perform this operation.
 *       
 *       **What happens:**
 *       - Product is removed from MongoDB
 *       - Product image is deleted from Cloudinary
 *       - Product is removed from all user carts (if referenced)
 *       - Featured products cache is updated if product was featured
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the product to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Product deleted successfully
 *                 data:
 *                   type: null
 *                   nullable: true
 *                   example: null
 *             example:
 *               success: true
 *               message: "Product deleted successfully"
 *               data: null
 *       400:
 *         description: Invalid product ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Validation failed
 *               errors:
 *                 - field: id
 *                   message: Invalid product ID format
 *       401:
 *         description: Unauthorized - No access token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Unauthorized - No access token provided
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: fail
 *               message: Product not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: error
 *               message: Server error
 */
router.delete(
  '/:id',
  protectRoute,
  adminRoute,
  validate(productIdSchema, 'params'),
  deleteProduct
);

export default router;
