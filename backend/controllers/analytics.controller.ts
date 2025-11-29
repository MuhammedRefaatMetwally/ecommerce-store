import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Get analytics overview
 * @route   GET /api/analytics
 * @access  Private/Admin
 */
export const getAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, days } = req.query;

    // Calculate date range
    let start: Date;
    let end: Date = new Date();

    if (days) {
      start = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    } else if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      // Default to last 7 days
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const analytics = await analyticsService.getAnalyticsOverview(start, end);

    res.status(200).json({
      success: true,
      data: analytics,
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    });
  }
);

/**
 * @desc    Get daily sales data
 * @route   GET /api/analytics/sales
 * @access  Private/Admin
 */
export const getDailySales = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, days } = req.query;

    let start: Date;
    let end: Date = new Date();

    if (days) {
      start = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    } else if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const salesData = await analyticsService.getDailySalesData(start, end);

    res.status(200).json({
      success: true,
      count: salesData.length,
      data: salesData,
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    });
  }
);

/**
 * @desc    Get top products
 * @route   GET /api/analytics/products/top
 * @access  Private/Admin
 */
export const getTopProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const topProducts = await analyticsService.getTopProducts(limit);

    res.status(200).json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  }
);

/**
 * @desc    Get revenue by category
 * @route   GET /api/analytics/revenue/category
 * @access  Private/Admin
 */
export const getRevenueByCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const revenueData = await analyticsService.getRevenueByCategory();

    res.status(200).json({
      success: true,
      count: revenueData.length,
      data: revenueData
    });
  }
);

/**
 * @desc    Clear analytics cache
 * @route   POST /api/analytics/cache/clear
 * @access  Private/Admin
 */
export const clearAnalyticsCache = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await analyticsService.clearCache();

    res.status(200).json({
      success: true,
      message: 'Analytics cache cleared successfully'
    });
  }
);