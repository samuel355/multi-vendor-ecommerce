import { Pool } from 'pg';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';
import { cache } from '../config/redis';
import logger from '../config/logger';

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
        SELECT oi.id 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.id = $1 
        AND oi.product_id = $2 
        AND o.user_id = $3
        AND o.status = 'delivered'
      `, [data.orderId, data.productId, data.userId]);

      if (!purchaseVerification.rows[0]) {
        throw ApiError.badRequest('Can only review purchased and delivered products');
      }

      // Check for existing review
      const existingReview = await client.query(`
        SELECT id FROM product_reviews
        WHERE user_id = $1 AND product_id = $2 AND order_id = $3
      `, [data.userId, data.productId, data.orderId]);

      if (existingReview.rows[0]) {
        throw ApiError.badRequest('You have already reviewed this product for this order');
      }

      // Create review
      const reviewQuery = `
        INSERT INTO product_reviews (
          user_id, product_id, order_id,
          rating, comment, images
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const review = await client.query(reviewQuery, [
        data.userId,
        data.productId,
        data.orderId,
        data.rating,
        data.comment,
        data.images || []
      ]);

      // Update product rating
      await client.query(`
        UPDATE products
        SET 
          average_rating = (
            SELECT AVG(rating)::numeric(3,2)
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

      // Clear cache
      await cache.del(`product:${data.productId}:reviews`);
      await cache.del(`user:${data.userId}:reviews`);

      return review.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const cacheKey = `product:${productId}:reviews:${page}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        pr.*,
        u.full_name as reviewer_name,
        u.avatar as reviewer_avatar
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.clerk_id
      WHERE pr.product_id = $1
      ORDER BY pr.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = $1
    `;

    const [reviews, count] = await Promise.all([
      this.pool.query(query, [productId, limit, offset]),
      this.pool.query(countQuery, [productId])
    ]);

    const result = {
      reviews: reviews.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };

    await cache.set(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour
    return result;
  }

  async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        pr.*,
        p.name as product_name,
        p.images as product_images
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      WHERE pr.user_id = $1
      ORDER BY pr.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE user_id = $1
    `;

    const [reviews, count] = await Promise.all([
      this.pool.query(query, [userId, limit, offset]),
      this.pool.query(countQuery, [userId])
    ]);

    return {
      reviews: reviews.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };
  }

  async deleteReview(reviewId: string, userId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get review details
      const reviewQuery = `
        SELECT * FROM product_reviews
        WHERE id = $1 AND user_id = $2
      `;

      const review = await client.query(reviewQuery, [reviewId, userId]);
      if (!review.rows[0]) {
        throw ApiError.notFound('Review not found or not authorized');
      }

      // Delete review
      await client.query('DELETE FROM product_reviews WHERE id = $1', [reviewId]);

      // Update product rating
      await client.query(`
        UPDATE products
        SET 
          average_rating = (
            SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
            FROM product_reviews
            WHERE product_id = $1
          ),
          review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = $1
          )
        WHERE id = $1
      `, [review.rows[0].product_id]);

      await client.query('COMMIT');

      // Clear cache
      await cache.del(`product:${review.rows[0].product_id}:reviews`);
      await cache.del(`user:${userId}:reviews`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new ReviewService();