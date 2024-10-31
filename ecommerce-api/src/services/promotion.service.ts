import { Pool } from 'pg';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';

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
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: Date;
    endDate: Date;
    minimumPurchase?: number;
    productIds?: string[];
    maxUses?: number;
  }) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Create promotion
      const promotionQuery = `
        INSERT INTO promotions (
          vendor_id, name, description,
          discount_type, discount_value,
          start_date, end_date,
          minimum_purchase, max_uses
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const promotion = await client.query(promotionQuery, [
        vendorId,
        data.name,
        data.description,
        data.discountType,
        data.discountValue,
        data.startDate,
        data.endDate,
        data.minimumPurchase,
        data.maxUses
      ]);

      // If specific products are targeted
      if (data.productIds?.length) {
        const productPromotionValues = data.productIds
          .map(productId => `('${promotion.rows[0].id}', '${productId}')`)
          .join(',');

        await client.query(`
          INSERT INTO promotion_products (promotion_id, product_id)
          VALUES ${productPromotionValues}
        `);
      }

      await client.query('COMMIT');
      return promotion.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async applyPromotion(promotionId: string, orderId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get promotion details
      const promotion = await client.query(
        'SELECT * FROM promotions WHERE id = $1',
        [promotionId]
      );

      if (!promotion.rows[0]) {
        throw ApiError.notFound('Promotion not found');
      }

      // Validate promotion
      if (
        new Date() < promotion.rows[0].start_date ||
        new Date() > promotion.rows[0].end_date
      ) {
        throw ApiError.badRequest('Promotion is not active');
      }

      // Apply discount
      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );

      const discountAmount = promotion.rows[0].discount_type === 'percentage'
        ? (order.rows[0].total_amount * promotion.rows[0].discount_value) / 100
        : promotion.rows[0].discount_value;

      await client.query(`
        UPDATE orders
        SET 
          discount_amount = $1,
          promotion_id = $2,
          final_amount = total_amount - $1
        WHERE id = $3
      `, [discountAmount, promotionId, orderId]);

      await client.query('COMMIT');
      return { discountAmount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new PromotionService();