import { Router } from 'express';
import {
  getAnalytics,
  getDailySales,
  getTopProducts,
  getRevenueByCategory,
  clearAnalyticsCache,
} from '../controllers/analytics.controller';
import { protectRoute, adminRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  analyticsQuerySchema,
  topProductsQuerySchema,
} from '../validators/analytics.validator';

const router = Router();

router.use(protectRoute, adminRoute);

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get complete analytics overview (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Number of days to analyze
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for custom range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for custom range
 *     responses:
 *       200:
 *         description: Complete analytics data
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             newThisMonth:
 *                               type: number
 *                             activeUsers:
 *                               type: number
 *                         products:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             featured:
 *                               type: number
 *                             outOfStock:
 *                               type: number
 *                         sales:
 *                           type: object
 *                           properties:
 *                             totalOrders:
 *                               type: number
 *                             completedOrders:
 *                               type: number
 *                             pendingOrders:
 *                               type: number
 *                             cancelledOrders:
 *                               type: number
 *                         revenue:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             thisMonth:
 *                               type: number
 *                             lastMonth:
 *                               type: number
 *                             growth:
 *                               type: number
 *                               description: Percentage growth
 *                         coupons:
 *                           type: object
 *                           properties:
 *                             active:
 *                               type: number
 *                             used:
 *                               type: number
 *                             totalDiscount:
 *                               type: number
 *                     dailySales:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           sales:
 *                             type: number
 *                           revenue:
 *                             type: number
 *                           orders:
 *                             type: number
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                           totalSold:
 *                             type: number
 *                           revenue:
 *                             type: number
 *                     revenueByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           orders:
 *                             type: number
 *                           percentage:
 *                             type: number
 *       403:
 *         description: Admin access required
 */
router.get('/', validate(analyticsQuerySchema, 'query'), getAnalytics);

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get daily sales data (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 7
 *     responses:
 *       200:
 *         description: Daily sales data
 */
router.get('/sales', validate(analyticsQuerySchema, 'query'), getDailySales);


/**
 * @swagger
 * /api/analytics/products/top:
 *   get:
 *     summary: Get top selling products (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Top products list
 */
router.get(
  '/products/top',
  validate(topProductsQuerySchema, 'query'),
  getTopProducts
);

/**
 * @swagger
 * /api/analytics/revenue/category:
 *   get:
 *     summary: Get revenue breakdown by category (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Revenue by category
 */
router.get('/revenue/category', getRevenueByCategory);

/**
 * @swagger
 * /api/analytics/cache/clear:
 *   post:
 *     summary: Clear analytics cache (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/cache/clear', clearAnalyticsCache);

export default router;
