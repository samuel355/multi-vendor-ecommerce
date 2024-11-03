import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

export const verifyWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiWebhookSecret = process.env.API_WEBHOOK_SECRET;
  const providedSecret = req.headers['x-webhook-secret'];

  if (!apiWebhookSecret || apiWebhookSecret !== providedSecret) {
    throw ApiError.forbidden('Invalid webhook secret');
  }

  next();
};