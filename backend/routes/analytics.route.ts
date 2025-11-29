import { Router } from 'express';
import {
  getAnalytics,
  getDailySales,
  getTopProducts,
  getRevenueByCategory,
  clearAnalyticsCache
} from '../controllers/analytics.controller';
import { protectRoute, adminRoute } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  analyticsQuerySchema,
  topProductsQuerySchema
} from '../validators/analytics.validator';

const router = Router();

router.use(protectRoute, adminRoute);

router.get(
  '/',
  validate(analyticsQuerySchema, 'query'),
  getAnalytics
);

router.get(
  '/sales',
  validate(analyticsQuerySchema, 'query'),
  getDailySales
);

router.get(
  '/products/top',
  validate(topProductsQuerySchema, 'query'),
  getTopProducts
);

router.get(
  '/revenue/category',
  getRevenueByCategory
);

router.post(
  '/cache/clear',
  clearAnalyticsCache
);

export default router;