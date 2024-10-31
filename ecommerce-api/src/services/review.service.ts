import { Pool } from 'pg';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';

export class ReviewService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async createReview(data: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
    images?: string[];
  }) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify purchase
      const purchaseVerification = await client.query(`
        SELECT id FROM order_items
        WHERE order_id = $1 AND product_id = $2
      `, [data.orderId, data.productId]);

      if (!purchaseVerification.rows[0]) {
        throw ApiError.badRequest('Can only review purchased products');
      }

      // Create review
      const review = await client.query(`
        INSERT INTO product_reviews (
          user_id, product_id, order_id,
          rating, comment, images
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.userId,
        data.productId,
        data.orderId,
        data.rating,
        data.comment,
        data.images
      ]);

      // Update product rating
      await client.query(`
        UPDATE products
        SET 
          average_rating = (
            SELECT AVG(rating)
            FROM product_reviews
            WHERE product_id = $1
          ),
          review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = $1
          )
        WHERE id = $1
      `, [data.productId]);

      await client.query('COMMIT');
      return review.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new ReviewService();