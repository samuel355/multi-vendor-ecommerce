import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreateSubscriptionDTO } from '../dtos/subscription.dto';
import subscriptionController from '../controllers/subscription.controller';

const subscriptionRouter = Router();

// Vendor routes
subscriptionRouter.post(
  '/subscription/vendor/:vendorId',
  requireAuth,
  validateRequest(CreateSubscriptionDTO),
  subscriptionController.initiateSubscription
);

subscriptionRouter.get(
  '/subscription/verify',
  subscriptionController.verifySubscription
);

// Admin routes
subscriptionRouter.get(
  '/subscription/admin/all',
  requireAuth,
  isAdmin,
  subscriptionController.getAllSubscriptions
);

subscriptionRouter.get(
  '/subscription/admin/stats',
  requireAuth,
  isAdmin,
  subscriptionController.getSubscriptionStats
);

export default subscriptionRouter;