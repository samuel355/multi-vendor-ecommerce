import { Request, Response, NextFunction } from 'express';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';

export const checkActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pool = await getPool();
    const result = await pool.query(
      `SELECT vs.status 
       FROM vendor_subscriptions vs
       WHERE vs.vendor_id = $1 
       AND vs.status = 'active'
       AND vs.end_date > CURRENT_TIMESTAMP`,
      [req.params.vendorId]
    );

    if (!result.rows[0]) {
      throw ApiError.forbidden('Active subscription required to manage products');
    }
    next();
  } catch (error) {
    next(error);
  }
};