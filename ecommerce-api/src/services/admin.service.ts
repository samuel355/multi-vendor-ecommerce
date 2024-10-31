import { Pool } from 'pg';
import { getPool } from '../config/database';
import { cache } from '../config/redis';
import ApiError from '../utils/apiError';
import logger from '../config/logger';
import { 
  UpdateVendorStatusDTO, 
  AdminVendorFilterDTO, 
  VendorStatus,
  CreateAnnouncementDTO
} from '../dtos/admin.dto';

export class AdminService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async getVendorAnalytics() {
    const query = `
      SELECT 
        COUNT(DISTINCT v.id) as total_vendors,
        COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_vendors,
        COUNT(DISTINCT CASE WHEN v.status = 'pending' THEN v.id END) as pending_vendors,
        COUNT(DISTINCT CASE WHEN v.created_at > NOW() - INTERVAL '30 days' THEN v.id END) as new_vendors,
        SUM(p.price * oi.quantity) as total_sales,
        COUNT(DISTINCT o.id) as total_orders,
        AVG(v.average_rating) as average_vendor_rating
      FROM vendors v
      LEFT JOIN order_items oi ON v.id = oi.vendor_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at > NOW() - INTERVAL '30 days'
      OR o.created_at IS NULL
    `;

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getVendors(filters: AdminVendorFilterDTO, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    let conditions = ['1=1'];
    let params: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`v.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters.searchTerm) {
      conditions.push(`(
        v.business_name ILIKE $${paramCount}
        OR v.contact_email ILIKE $${paramCount}
        OR v.phone ILIKE $${paramCount}
      )`);
      params.push(`%${filters.searchTerm}%`);
      paramCount++;
    }

    if (filters.region) {
      conditions.push(`v.region = $${paramCount}`);
      params.push(filters.region);
      paramCount++;
    }

    if (filters.category) {
      conditions.push(`v.shop_category = $${paramCount}`);
      params.push(filters.category);
      paramCount++;
    }

    if (filters.hasActiveSubscription !== undefined) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM vendor_subscriptions vs
          WHERE vs.vendor_id = v.id
          AND vs.status = 'active'
          AND vs.end_date > NOW()
        ) = $${paramCount}
      `);
      params.push(filters.hasActiveSubscription);
      paramCount++;
    }

    const query = `
      SELECT 
        v.*,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT oi.id) as total_orders,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
        (
          SELECT JSON_BUILD_OBJECT(
            'plan_name', sp.name,
            'end_date', vs.end_date
          )
          FROM vendor_subscriptions vs
          JOIN subscription_plans sp ON vs.plan_id = sp.id
          WHERE vs.vendor_id = v.id
          AND vs.status = 'active'
          AND vs.end_date > NOW()
          LIMIT 1
        ) as subscription_info
      FROM vendors v
      LEFT JOIN products p ON v.id = p.vendor_id AND p.is_active = true
      LEFT JOIN order_items oi ON v.id = oi.vendor_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(DISTINCT v.id)
      FROM vendors v
      WHERE ${conditions.join(' AND ')}
    `;

    const [vendors, count] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, params.slice(0, -2))
    ]);

    return {
      vendors: vendors.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };
  }

  async updateVendorStatus(vendorId: string, data: UpdateVendorStatusDTO) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update vendor status
      const updateQuery = `
        UPDATE vendors
        SET 
          status = $1,
          status_reason = $2,
          status_changed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        data.status,
        data.reason,
        vendorId
      ]);

      if (!result.rows[0]) {
        throw ApiError.notFound('Vendor not found');
      }

      // Log status change
      await client.query(`
        INSERT INTO vendor_status_logs (
          vendor_id, previous_status, new_status, 
          reason, changed_by
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        vendorId,
        result.rows[0].status,
        data.status,
        data.reason,
        'admin' // You might want to pass actual admin ID
      ]);

      // If suspended, handle subscriptions
      if (data.status === VendorStatus.SUSPENDED) {
        await client.query(`
          UPDATE vendor_subscriptions
          SET status = 'suspended'
          WHERE vendor_id = $1 AND status = 'active'
        `, [vendorId]);

        // Deactivate products
        await client.query(`
          UPDATE products
          SET is_active = false
          WHERE vendor_id = $1
        `, [vendorId]);
      }

      await client.query('COMMIT');

      // Clear cache
      await this.clearVendorCache(vendorId);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createAnnouncement(data: CreateAnnouncementDTO) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const announcementQuery = `
        INSERT INTO vendor_announcements (
          title, message, valid_until
        ) VALUES ($1, $2, $3)
        RETURNING id
      `;

      const announcement = await client.query(announcementQuery, [
        data.title,
        data.message,
        data.validUntil || null
      ]);

      // Link announcement to vendors
      for (const vendorId of data.targetVendors) {
        await client.query(`
          INSERT INTO vendor_announcement_recipients (
            announcement_id, vendor_id
          ) VALUES ($1, $2)
        `, [announcement.rows[0].id, vendorId]);
      }

      await client.query('COMMIT');

      // Optionally, send notifications to vendors
      this.notifyVendors(data.targetVendors, {
        type: 'announcement',
        title: data.title,
        message: data.message
      });

      return announcement.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getVendorPerformanceMetrics(vendorId: string) {
    const query = `
      SELECT 
        COUNT(DISTINCT oi.id) as total_orders,
        COUNT(DISTINCT CASE WHEN oi.status = 'delivered' THEN oi.id END) as completed_orders,
        COUNT(DISTINCT CASE WHEN oi.status = 'cancelled' THEN oi.id END) as cancelled_orders,
        COALESCE(AVG(CASE WHEN oi.status = 'delivered' 
          THEN EXTRACT(EPOCH FROM (oi.actual_delivery_date - o.created_at))/3600 
        END), 0) as avg_delivery_time,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(AVG(sr.rating), 0) as average_rating,
        COUNT(DISTINCT sr.id) as total_reviews
      FROM vendors v
      LEFT JOIN order_items oi ON v.id = oi.vendor_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON v.id = p.vendor_id AND p.is_active = true
      LEFT JOIN shop_reviews sr ON v.id = sr.vendor_id
      WHERE v.id = $1
      GROUP BY v.id
    `;

    const result = await this.pool.query(query, [vendorId]);
    return result.rows[0];
  }

  private async clearVendorCache(vendorId: string) {
    await Promise.all([
      cache.del(`vendor:${vendorId}`),
      cache.del('vendors:all'),
      cache.del('admin:vendors:*')
    ]);
  }

  private async notifyVendors(vendorIds: string[], notification: any) {
    // Implement your notification logic here
    // This could be email, SMS, push notifications, etc.
  }
}

export default new AdminService();