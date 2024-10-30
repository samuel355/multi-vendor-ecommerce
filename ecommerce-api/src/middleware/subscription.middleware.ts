import { Request, Response, NextFunction } from 'express';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';

export const checkProductLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.params.vendorId;
    const pool = await getPool();

    // Get vendor's current subscription and product count
    const query = `
      SELECT 
        sp.product_limit,
        COUNT(p.id) as current_products
      FROM vendor_subscriptions vs
      JOIN subscription_plans sp ON vs.plan_id = sp.id
      LEFT JOIN products p ON p.vendor_id = vs.vendor_id
      WHERE vs.vendor_id = $1
        AND vs.status = 'active'
        AND p.is_active = true
      GROUP BY sp.product_limit
    `;

    const result = await pool.query(query, [vendorId]);
    
    if (!result.rows[0]) {
      throw ApiError.forbidden('No active subscription found');
    }

    const { product_limit, current_products } = result.rows[0];

    if (product_limit && current_products >= product_limit) {
      throw ApiError.forbidden('Product limit reached for current subscription plan');
    }

    next();
  } catch (error) {
    next(error);
  }
};