import { Request, Response, NextFunction } from 'express';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import ApiError from '../utils/apiError';

export const verifyWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Please add WEBHOOK_SECRET to .env file');
  }

  const headers = req.headers;
  const payload = req.body;

  const wh = new Webhook(webhookSecret);
  
  try {
    wh.verify(
      JSON.stringify(payload),
      {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      }
    );
    next();
  } catch (err) {
    console.error('Webhook verification failed:', err);
    throw ApiError.forbidden('Invalid webhook signature');
  }
};