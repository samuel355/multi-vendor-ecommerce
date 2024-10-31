import { Pool } from 'pg';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';
import { cache } from '../config/redis';
import logger from '../config/logger';

export class WishlistService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async addToWishlist(userId: string, productId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if product exists and is active
      const productCheck = await client.query(`
        SELECT id FROM products
        WHERE id = $1 AND is_active = true
      `, [productId]);

      if (!productCheck.rows[0]) {
        throw ApiError.notFound('Product not found or inactive');
      }

      // Add to wishlist
      const query = `
        INSERT INTO wishlists (user_id, product_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, product_id) DO NOTHING
        RETURNING *
      `;

      const result = await client.query(query, [userId, productId]);

      await client.query('COMMIT');

      // Clear cache
      await cache.del(`wishlist:${userId}`);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async removeFromWishlist(userId: string, productId: string) {
    const query = `
      DELETE FROM wishlists
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [userId, productId]);

    if (!result.rows[0]) {
      throw ApiError.notFound('Item not found in wishlist');
    }

    // Clear cache
    await cache.del(`wishlist:${userId}`);

    return result.rows[0];
  }

  async getWishlist(userId: string, page: number = 1, limit: number = 10) {
    const cacheKey = `wishlist:${userId}:${page}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        p.*,
        v.business_name as vendor_name,
        v.id as vendor_id,
        w.created_at as added_at
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN vendors v ON p.vendor_id = v.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1 AND p.is_active = true
    `;

    const [items, count] = await Promise.all([
      this.pool.query(query, [userId, limit, offset]),
      this.pool.query(countQuery, [userId])
    ]);

    const result = {
      items: items.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };

    await cache.set(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour
    return result;
  }

  async checkProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM wishlists
        WHERE user_id = $1 AND product_id = $2
      ) as exists
    `;

    const result = await this.pool.query(query, [userId, productId]);
    return result.rows[0].exists;
  }

  async clearWishlist(userId: string) {
    const query = `
      DELETE FROM wishlists
      WHERE user_id = $1
      RETURNING *
    `;

    await this.pool.query(query, [userId]);
    await cache.del(`wishlist:${userId}`);
  }

  async moveToCart(userId: string, productId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get user's cart or create new one
      let cartResult = await client.query(
        'SELECT id FROM shopping_carts WHERE user_id = $1',
        [userId]
      );

      let cartId;
      if (!cartResult.rows[0]) {
        const newCart = await client.query(
          'INSERT INTO shopping_carts (user_id) VALUES ($1) RETURNING id',
          [userId]
        );
        cartId = newCart.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }

      // Add to cart
      await client.query(`
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, 1)
        ON CONFLICT (cart_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + 1
      `, [cartId, productId]);

      // Remove from wishlist
      await client.query(`
        DELETE FROM wishlists
        WHERE user_id = $1 AND product_id = $2
      `, [userId, productId]);

      await client.query('COMMIT');

      // Clear caches
      await cache.del(`wishlist:${userId}`);
      await cache.del(`cart:${userId}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new WishlistService();