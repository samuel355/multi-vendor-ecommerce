import { Pool } from 'pg';
import { getPool } from '../config/database';
import { cache } from '../config/redis';
import ApiError from '../utils/apiError';
import { DiscountType, PromotionStatus } from '../dtos/promotion.dto';
import logger from '../config/logger';

export class PromotionService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async createPromotion(vendorId: string, data: {
    name: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    minimumPurchase?: number;
    productIds?: string[];
    maxUses?: number;
    isPublic?: boolean;
  }) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate dates
      if (new Date(data.startDate) > new Date(data.endDate)) {
        throw ApiError.badRequest('End date must be after start date');
      }

      // Create promotion
      const promotionQuery = `
        INSERT INTO promotions (
          vendor_id, name, description, discount_type,
          discount_value, start_date, end_date,
          minimum_purchase, max_uses, is_public,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const promotionStatus = new Date(data.startDate) > new Date() 
        ? PromotionStatus.SCHEDULED 
        : PromotionStatus.ACTIVE;

      const promotion = await client.query(promotionQuery, [
        vendorId,
        data.name,
        data.description,
        data.discountType,
        data.discountValue,
        data.startDate,
        data.endDate,
        data.minimumPurchase || null,
        data.maxUses || null,
        data.isPublic || false,
        promotionStatus
      ]);

      // If specific products are targeted
      if (data.productIds?.length) {
        const productPromotionValues = data.productIds.map(productId => ({
          promotion_id: promotion.rows[0].id,
          product_id: productId
        }));

        await client.query(`
          INSERT INTO promotion_products (promotion_id, product_id)
          SELECT * FROM jsonb_to_recordset($1::jsonb) 
          AS t(promotion_id UUID, product_id UUID)
        `, [JSON.stringify(productPromotionValues)]);
      }

      await client.query('COMMIT');

      // Clear cache
      await this.clearPromotionCache(vendorId);

      return promotion.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getActivePromotions(filters: {
    vendorId?: string;
    category?: string;
    minPurchase?: number;
  }) {
    const whereConditions = [
      "status = 'active'",
      "start_date <= CURRENT_TIMESTAMP",
      "end_date > CURRENT_TIMESTAMP",
      "is_public = true"
    ];
    
    if (filters.vendorId) {
      whereConditions.push(`vendor_id = '${filters.vendorId}'`);
    }
    
    if (filters.minPurchase) {
      whereConditions.push(`minimum_purchase <= ${filters.minPurchase}`);
    }
  
    const query = `
      SELECT 
        p.*,
        v.business_name as vendor_name,
        CASE 
          WHEN pp.product_count IS NULL THEN 'All Products'
          ELSE 'Selected Products'
        END as scope,
        pp.product_count
      FROM promotions p
      JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN (
        SELECT 
          promotion_id, 
          COUNT(*) as product_count
        FROM promotion_products
        GROUP BY promotion_id
      ) pp ON p.id = pp.promotion_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.discount_value DESC
    `;
  
    const result = await this.pool.query(query);
    return result.rows;
  }
  
  async getPromotionStatistics(promotionId: string) {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT pu.order_id) as total_uses,
        COUNT(DISTINCT pu.user_id) as unique_customers,
        SUM(pu.discount_amount) as total_discount_amount,
        AVG(o.total_amount) as average_order_value,
        json_agg(DISTINCT pr.category) as popular_categories
      FROM promotions p
      LEFT JOIN promotion_uses pu ON p.id = pu.promotion_id
      LEFT JOIN orders o ON pu.order_id = o.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products pr ON oi.product_id = pr.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
  
    const result = await this.pool.query(query, [promotionId]);
    return result.rows[0];
  }
  
  async checkPromotionEligibility(promotionId: string, userId: string, orderId: string) {
    const query = `
      SELECT 
        p.*,
        o.total_amount as order_amount,
        COUNT(pu.id) as user_usage_count
      FROM promotions p
      JOIN orders o ON o.id = $3
      LEFT JOIN promotion_uses pu ON p.id = pu.promotion_id AND pu.user_id = $2
      WHERE p.id = $1
      GROUP BY p.id, o.total_amount
    `;
  
    const result = await this.pool.query(query, [promotionId, userId, orderId]);
    
    if (!result.rows[0]) {
      return { eligible: false, reason: 'Promotion not found' };
    }
  
    const promotion = result.rows[0];
  
    if (promotion.status !== 'active') {
      return { eligible: false, reason: 'Promotion is not active' };
    }
  
    if (promotion.minimum_purchase && promotion.order_amount < promotion.minimum_purchase) {
      return { 
        eligible: false, 
        reason: `Minimum purchase amount of ${promotion.minimum_purchase} required` 
      };
    }
  
    if (promotion.max_uses_per_user && promotion.user_usage_count >= promotion.max_uses_per_user) {
      return { 
        eligible: false, 
        reason: 'You have reached the maximum usage limit for this promotion' 
      };
    }
  
    return { eligible: true };
  }
  
  async updatePromotion(promotionId: string, vendorId: string, updates: Partial<{
    name: string;
    description: string;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    minimumPurchase: number;
    productIds: string[];
    maxUses: number;
    isActive: boolean;
  }>) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify ownership
      const existingPromotion = await client.query(
        'SELECT * FROM promotions WHERE id = $1 AND vendor_id = $2',
        [promotionId, vendorId]
      );

      if (!existingPromotion.rows[0]) {
        throw ApiError.notFound('Promotion not found or not authorized');
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${this.camelToSnake(key)} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return existingPromotion.rows[0];
      }

      values.push(promotionId, vendorId);

      const query = `
        UPDATE promotions
        SET ${updateFields.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCounter} AND vendor_id = $${paramCounter + 1}
        RETURNING *
      `;

      const result = await client.query(query, values);

      // Update product associations if provided
      if (updates.productIds) {
        await client.query(
          'DELETE FROM promotion_products WHERE promotion_id = $1',
          [promotionId]
        );

        if (updates.productIds.length > 0) {
          const productPromotionValues = updates.productIds.map(productId => ({
            promotion_id: promotionId,
            product_id: productId
          }));

          await client.query(`
            INSERT INTO promotion_products (promotion_id, product_id)
            SELECT * FROM jsonb_to_recordset($1::jsonb) 
            AS t(promotion_id UUID, product_id UUID)
          `, [JSON.stringify(productPromotionValues)]);
        }
      }

      await client.query('COMMIT');

      // Clear cache
      await this.clearPromotionCache(vendorId);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPromotion(promotionId: string) {
    const query = `
      SELECT 
        p.*,
        json_agg(DISTINCT pp.product_id) as product_ids,
        json_agg(DISTINCT pr.name) as product_names
      FROM promotions p
      LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
      LEFT JOIN products pr ON pp.product_id = pr.id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await this.pool.query(query, [promotionId]);
    if (!result.rows[0]) {
      throw ApiError.notFound('Promotion not found');
    }

    return result.rows[0];
  }

  async getVendorPromotions(vendorId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const cacheKey = `promotions:vendor:${vendorId}:${page}:${limit}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) return JSON.parse(cached);

    const query = `
      SELECT 
        p.*,
        json_agg(DISTINCT pp.product_id) as product_ids,
        COUNT(DISTINCT pu.id) as uses_count
      FROM promotions p
      LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
      LEFT JOIN promotion_uses pu ON p.id = pu.promotion_id
      WHERE p.vendor_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM promotions WHERE vendor_id = $1
    `;

    const [promotions, count] = await Promise.all([
      this.pool.query(query, [vendorId, limit, offset]),
      this.pool.query(countQuery, [vendorId])
    ]);

    const result = {
      promotions: promotions.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };

    await cache.set(cacheKey, JSON.stringify(result), 300); // Cache for 5 minutes
    return result;
  }

  async validateAndApplyPromotion(promotionId: string, orderId: string, userId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get promotion details with validation
      const promotionQuery = `
        SELECT p.*, COUNT(pu.id) as current_uses
        FROM promotions p
        LEFT JOIN promotion_uses pu ON p.id = pu.promotion_id
        WHERE p.id = $1
        AND p.status = 'active'
        AND p.start_date <= CURRENT_TIMESTAMP
        AND p.end_date > CURRENT_TIMESTAMP
        GROUP BY p.id
      `;

      const promotion = await client.query(promotionQuery, [promotionId]);

      if (!promotion.rows[0]) {
        throw ApiError.badRequest('Invalid or expired promotion');
      }

      const { 
        max_uses, 
        current_uses, 
        minimum_purchase,
        discount_type,
        discount_value 
      } = promotion.rows[0];

      // Check usage limit
      if (max_uses && current_uses >= max_uses) {
        throw ApiError.badRequest('Promotion usage limit reached');
      }

      // Get order details
      const orderQuery = `
        SELECT total_amount, user_id
        FROM orders
        WHERE id = $1 AND status = 'pending'
      `;

      const order = await client.query(orderQuery, [orderId]);

      if (!order.rows[0]) {
        throw ApiError.notFound('Order not found or invalid');
      }

      if (order.rows[0].user_id !== userId) {
        throw ApiError.forbidden('Not authorized to apply promotion to this order');
      }

      // Check minimum purchase requirement
      if (minimum_purchase && order.rows[0].total_amount < minimum_purchase) {
        throw ApiError.badRequest(
          `Order total must be at least ${minimum_purchase} to use this promotion`
        );
      }

      // Calculate discount
      const discountAmount = discount_type === DiscountType.PERCENTAGE
        ? (order.rows[0].total_amount * discount_value) / 100
        : discount_value;

      // Apply discount to order
      await client.query(`
        UPDATE orders
        SET 
          promotion_id = $1,
          discount_amount = $2,
          final_amount = total_amount - $2
        WHERE id = $3
      `, [promotionId, discountAmount, orderId]);

      // Record promotion use
      await client.query(`
        INSERT INTO promotion_uses (promotion_id, order_id, user_id, discount_amount)
        VALUES ($1, $2, $3, $4)
      `, [promotionId, orderId, userId, discountAmount]);

      await client.query('COMMIT');

      return {
        discountAmount,
        finalAmount: order.rows[0].total_amount - discountAmount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async clearPromotionCache(vendorId: string) {
    try {
      await cache.clearPattern(`promotions:vendor:${vendorId}:*`);
    } catch (error) {
      logger.error('Error clearing promotion cache:', error);
    }
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export default new PromotionService();