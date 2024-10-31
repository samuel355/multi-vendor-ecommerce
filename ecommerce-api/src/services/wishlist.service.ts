import { Pool } from 'pg';
import { getPool } from '../config/database';

export class WishlistService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async addToWishlist(userId: string, productId: string) {
    const query = `
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;

    const result = await this.pool.query(query, [userId, productId]);
    return result.rows[0];
  }

  async removeFromWishlist(userId: string, productId: string) {
    const query = `
      DELETE FROM wishlists
      WHERE user_id = $1 AND product_id = $2
    `;

    await this.pool.query(query, [userId, productId]);
  }

  async getWishlist(userId: string) {
    const query = `
      SELECT 
        p.*,
        v.business_name as vendor_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN vendors v ON p.vendor_id = v.id
      WHERE w.user_id = $1
      AND p.is_active = true
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }
}

export default new WishlistService();