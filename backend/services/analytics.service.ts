import Order from "../models/order.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import Coupon from "../models/coupon.model";
import { redis } from "../lib/redis";
import {
  IAnalyticsOverview,
  IDailySalesData,
  ITopProduct,
  IRevenueByCategory,
  IAnalyticsResponse,
} from "../types/analytics.types";
import { OrderStatus } from "../types/order.types";

export class AnalyticsService {
  ANALYTICS_CACHE_KEY = "analytics:overview";

  private buildCacheKey(startDate: Date, endDate: Date): string {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];
    return `${this.ANALYTICS_CACHE_KEY}:${start}:${end}`;
  }

  CACHE_TTL = 300;

  async getAnalyticsOverview(
    startDate: Date,
    endDate: Date
  ): Promise<IAnalyticsResponse> {
    const cacheKey = this.buildCacheKey(startDate, endDate);
    const cached = await this.getCachedAnalytics(cacheKey);
    if (cached) {
      return cached;
    }

    const [overview, dailySales, topProducts, revenueByCategory] =
      await Promise.all([
        this.getOverviewData(startDate, endDate),
        this.getDailySalesData(startDate, endDate),
        this.getTopProducts(10),
        this.getRevenueByCategory(),
      ]);

    const result: IAnalyticsResponse = {
      overview,
      dailySales,
      topProducts,
      revenueByCategory,
    };

    await this.cacheAnalytics(cacheKey, result);

    return result;
  }

  private async getOverviewData(
    startDate: Date,
    endDate: Date
  ): Promise<IAnalyticsOverview> {
    const totalUsers = await User.countDocuments();
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: this.getStartOfMonth() },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUserIds = await Order.distinct("user", {
      createdAt: { $gte: thirtyDaysAgo },
    });

    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ isFeatured: true });

    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({
      status: OrderStatus.COMPLETED,
    });
    const pendingOrders = await Order.countDocuments({
      status: OrderStatus.PENDING,
    });
    const cancelledOrders = await Order.countDocuments({
      status: OrderStatus.CANCELLED,
    });

    const revenueData = await Order.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: OrderStatus.COMPLETED,
          createdAt: { $gte: this.getStartOfMonth() },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: OrderStatus.COMPLETED,
          createdAt: {
            $gte: this.getStartOfLastMonth(),
            $lt: this.getStartOfMonth(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const thisMonth = thisMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;
    const growth =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const usedCoupons = await Coupon.countDocuments({ usedCount: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({
      stock: { $lte: 0 },
    });
    const discountData = await Order.aggregate([
      { $match: { $match: { discountAmount: { $gt: 0 }, status: OrderStatus.COMPLETED } } },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: "$discountAmount" },
        },
      },
    ]);

    return {
      users: {
        total: totalUsers,
        newThisMonth,
        activeUsers: activeUserIds.length,
      },
      products: {
        total: totalProducts,
        featured: featuredProducts,
        outOfStock: outOfStockProducts,
      },
      sales: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
      },
      revenue: {
        total: parseFloat(totalRevenue.toFixed(2)),
        thisMonth: parseFloat(thisMonth.toFixed(2)),
        lastMonth: parseFloat(lastMonth.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
      },
      coupons: {
        active: activeCoupons,
        used: usedCoupons,
        totalDiscount: parseFloat(
          (discountData[0]?.totalDiscount || 0).toFixed(2)
        ),
      },
    };
  }

  async getDailySalesData(
    startDate: Date,
    endDate: Date
  ): Promise<IDailySalesData[]> {
    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: OrderStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateArray = this.getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const found = dailyData.find((item) => item._id === date);

      return {
        date,
        sales: found?.sales || 0,
        revenue: parseFloat((found?.revenue || 0).toFixed(2)),
        orders: found?.sales || 0,
      };
    });
  }

  async getTopProducts(limit: number = 10): Promise<ITopProduct[]> {
    const topProducts = await Order.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productId: "$_id",
          name: "$productInfo.name",
          image: "$productInfo.image",
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);

    return topProducts.map((p) => ({
      productId: p.productId.toString(),
      name: p.name,
      image: p.image,
      totalSold: p.totalSold,
      revenue: parseFloat(p.revenue.toFixed(2)),
    }));
  }

  async getRevenueByCategory(): Promise<IRevenueByCategory[]> {
    const categoryData = await Order.aggregate([
  { $match: { status: OrderStatus.COMPLETED } },
  { $unwind: "$products" },
  {
    $lookup: {
      from: "products",
      localField: "products.product",
      foreignField: "_id",
      as: "productInfo",
    },
  },
  { $unwind: "$productInfo" },

  // group by category + orderId to deduplicate orders per category
  {
    $group: {
      _id: { category: "$productInfo.category", orderId: "$_id" },
      revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
    },
  },

  // group by category to sum revenue and count distinct orders
  {
    $group: {
      _id: "$_id.category",
      revenue: { $sum: "$revenue" },
      orders: { $sum: 1 }, 
    },
  },
  { $sort: { revenue: -1 } },
]);

    const totalRevenue = categoryData.reduce(
      (sum, cat) => sum + cat.revenue,
      0
    );

    return categoryData.map((cat) => ({
      category: cat._id,
      revenue: parseFloat(cat.revenue.toFixed(2)),
      orders: cat.orders,
      percentage:
        totalRevenue > 0
          ? parseFloat(((cat.revenue / totalRevenue) * 100).toFixed(2))
          : 0,
    }));
  }

  private getDatesInRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getStartOfLastMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  private async cacheAnalytics(
    key: string,
    data: IAnalyticsResponse
  ): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
    } catch (error) {
      console.error("Error caching analytics:", error);
    }
  }

  private async getCachedAnalytics(
    key: string
  ): Promise<IAnalyticsResponse | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached analytics:", error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await redis.del(this.ANALYTICS_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing analytics cache:", error);
    }
  }
}

export const analyticsService = new AnalyticsService();
