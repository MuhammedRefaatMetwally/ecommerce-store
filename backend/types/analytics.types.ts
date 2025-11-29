export interface IAnalyticsOverview {
  users: {
    total: number;
    newThisMonth: number;
    activeUsers: number;
  };
  products: {
    total: number;
    featured: number;
    outOfStock: number;
  };
  sales: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number; // Percentage growth
  };
  coupons: {
    active: number;
    used: number;
    totalDiscount: number;
  };
}

export interface IDailySalesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface ITopProduct {
  productId: string;
  name: string;
  image: string;
  totalSold: number;
  revenue: number;
}

export interface IRevenueByCategory {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface IAnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export interface IAnalyticsResponse {
  overview: IAnalyticsOverview;
  dailySales: IDailySalesData[];
  topProducts?: ITopProduct[];
  revenueByCategory?: IRevenueByCategory[];
}