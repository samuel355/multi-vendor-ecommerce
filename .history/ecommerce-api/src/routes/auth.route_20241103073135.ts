import express from 'express';
import { isAdmin, requireAuth } from '../middleware/auth.middleware';
import {
  webhook,
  getProfile,
  updateRole,
  listUsers,
} from '../controllers/auth.controller';
import { verifyWebhook } from '../middleware/verify-webhook.middleware';

const authRouter = express.Router();

/**
 * @route POST /api/auth/webhook
 * @desc Handle Clerk webhook events
 * @access Public
 */
authRouter.post('/webhook', verifyWebhook, webhook);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
authRouter.get('/profile', requireAuth, , verifyWebhook getProfile);

/**
 * @route PUT /api/auth/role
 * @desc Update user role
 * @access Admin only
 */
authRouter.put('/role', requireAuth, isAdmin, updateRole);

/**
 * @route GET /api/auth/users
 * @desc List all users
 * @access Admin only
 */
authRouter.get('/users', requireAuth, isAdmin, listUsers);

export default authRouter;