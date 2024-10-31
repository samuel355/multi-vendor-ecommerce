import { Pool } from 'pg';
import { getPool } from '../config/database';
import { cache } from '../config/redis';
import { TimeFrame } from '../dtos/analytics.dto';
import ApiError from '../utils/apiError';
import logger from '../config/logger';

export class AnalyticsService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async getVendorAnalytics(vendorId: string, timeframe: TimeFrame, startDate?: Date, endDate?: Date) {
    const cacheKey = `analytics:vendor:${vendorId}:${timeframe}:${startDate}:${endDate}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const client = await this.pool.connect();

    try {
      const dateFilter = startDate && endDate 
        ? `AND oi.created_at BETWEEN $2 AND $3`
        : '';

      const params = startDate && endDate 
        ? [vendorId, startDate, endDate]
        : [vendorId];

      // Sales Analytics
      const salesQuery = `
        SELECT 
          DATE_TRUNC($1, oi.created_at) as period,
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(oi.id) as items_sold,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.subtotal) as revenue,
          SUM(oi.delivery_fee) as delivery_fees,
          ARRAY_AGG(DISTINCT p.category) as categories
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE oi.vendor_id = $2 ${dateFilter}
        GROUP BY DATE_TRUNC($1, oi.created_at)
        ORDER BY period DESC
      `;

      // Product Performance
      const productQuery = `
        SELECT 
          p.id,
          p.name,
          p.category,
          COUNT(oi.id) as times_ordered,
          SUM(oi.quantity) as quantity_sold,
          SUM(oi.subtotal) as revenue,
          AVG(pr.rating) as average_rating,
          COUNT(DISTINCT pr.id) as review_count
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        WHERE p.vendor_id = $1 ${dateFilter}
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 10
      `;

      // Customer Analytics
      const customerQuery = `
        SELECT 
          COUNT(DISTINCT o.user_id) as total_customers,
          COUNT(DISTINCT CASE 
            WHEN o.created_at > CURRENT_DATE - INTERVAL '30 days' 
            THEN o.user_id END) as new_customers,
          AVG(o.total_amount) as average_order_value
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.vendor_id = $1 ${dateFilter}
      `;

      const [sales, topProducts, customerStats] = await Promise.all([
        client.query(salesQuery, [timeframe, ...params]),
        client.query(productQuery, params),
        client.query(customerQuery, params)
      ]);

      const result = {
        sales: sales.rows,
        topProducts: topProducts.rows,
        customerStats: customerStats.rows[0],
        timeframe,
        period: {
          start: startDate || sales.rows[sales.rows.length - 1]?.period,
          end: endDate || sales.rows[0]?.period
        }
      };

      await cache.set(cacheKey, JSON.stringify(result), 1800); // Cache for 30 minutes
      return result;

    } finally {
      client.release();
    }
  }

  async getProductAnalytics(productId: string, timeframe: TimeFrame) {
    const cacheKey = `analytics:product:${productId}:${timeframe}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const client = await this.pool.connect();

    try {
      // Sales Trend
      const salesQuery = `
        SELECT 
          DATE_TRUNC($1, oi.created_at) as period,
          SUM(oi.quantity) as quantity_sold,
          SUM(oi.subtotal) as revenue,
          COUNT(DISTINCT o.id) as order_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = $2
        GROUP BY DATE_TRUNC($1, oi.created_at)
        ORDER BY period DESC
      `;

      // Reviews Analysis
      const reviewsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating)::numeric(3,2) as average_rating,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
          COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews
        FROM product_reviews
        WHERE product_id = $1
      `;

      // Customer Demographics
      const demographicsQuery = `
        SELECT 
          u.region,
          COUNT(DISTINCT o.user_id) as customer_count,
          AVG(oi.quantity) as avg_quantity_per_order
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN users u ON o.user_id = u.clerk_id
        WHERE oi.product_id = $1
        GROUP BY u.region
      `;

      const [sales, reviews, demographics] = await Promise.all([
        client.query(salesQuery, [timeframe, productId]),
        client.query(reviewsQuery, [productId]),
        client.query(demographicsQuery, [productId])
      ]);

      const result = {
        sales: sales.rows,
        reviews: reviews.rows[0],
        demographics: demographics.rows,
        timeframe
      };

      await cache.set(cacheKey, JSON.stringify(result), 1800);
      return result;

    } finally {
      client.release();
    }
  }

  async getDashboardStats(vendorId: string) {
    const cacheKey = `analytics:dashboard:${vendorId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const client = await this.pool.connect();

    try {
      // Today's Stats
      const todayStatsQuery = `
        SELECT 
          COUNT(DISTINCT o.id) as orders_today,
          SUM(oi.subtotal) as revenue_today,
          COUNT(DISTINCT o.user_id) as customers_today
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.vendor_id = $1
        AND DATE(oi.created_at) = CURRENT_DATE
      `;

      // Low Stock Alert
      const lowStockQuery = `
        SELECT id, name, quantity
        FROM products
        WHERE vendor_id = $1
        AND quantity <= reorder_point
        AND is_active = true
        LIMIT 5
      `;

      // Recent Orders
      const recentOrdersQuery = `
        SELECT 
          o.id,
          o.status,
          o.total_amount,
          o.created_at,
          json_agg(json_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
          )) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE oi.vendor_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `;

      const [todayStats, lowStock, recentOrders] = await Promise.all([
        client.query(todayStatsQuery, [vendorId]),
        client.query(lowStockQuery, [vendorId]),
        client.query(recentOrdersQuery, [vendorId])
      ]);

      const result = {
        todayStats: todayStats.rows[0],
        lowStock: lowStock.rows,
        recentOrders: recentOrders.rows
      };

      await cache.set(cacheKey, JSON.stringify(result), 300); // Cache for 5 minutes
      return result;

    } finally {
      client.release();
    }
  }
}

export default new AnalyticsService();