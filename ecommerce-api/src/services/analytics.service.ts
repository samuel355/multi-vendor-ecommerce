import { Pool } from "pg";
import { getPool } from "../config/database";
import { cache } from "../config/redis";

export class AnalyticsService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async getVendorAnalytics(
    vendorId: string,
    timeframe: "daily" | "weekly" | "monthly",
  ) {
    const cacheKey = `analytics:vendor:${vendorId}:${timeframe}`;
    const cached = await cache.get(cacheKey);

    if (cached) return JSON.parse(cached);

    const query = `
      SELECT
        DATE_TRUNC($1, oi.created_at) as period,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity) as items_sold,
        SUM(oi.subtotal) as revenue,
        ARRAY_AGG(DISTINCT p.category) as top_categories
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE oi.vendor_id = $2
      AND oi.created_at > CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE_TRUNC($1, oi.created_at)
      ORDER BY period DESC
    `;

    const result = await this.pool.query(query, [timeframe, vendorId]);
    await cache.set(cacheKey, JSON.stringify(result.rows), 3600);

    return result.rows;
  }

  async getProductPerformance(productId: string) {
    const query = `
      SELECT
        p.id,
        p.name,
        COUNT(oi.id) as times_ordered,
        SUM(oi.quantity) as total_quantity_sold,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `;

    const result = await this.pool.query(query, [productId]);
    return result.rows[0];
  }
}

export default new AnalyticsService();
