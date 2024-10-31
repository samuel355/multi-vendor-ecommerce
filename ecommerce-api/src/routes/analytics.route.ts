import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { requireAuth, isVendor } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { AnalyticsQueryDTO, ProductAnalyticsDTO } from '../dtos/analytics.dto';

const analyticsRouter = Router();

// All analytics routes require authentication and vendor role
analyticsRouter.use(requireAuth, isVendor);

analyticsRouter.get(
  '/vendor/:vendorId',
  validateRequest(AnalyticsQueryDTO, true),
  analyticsController.getVendorAnalytics
);

analyticsRouter.get(
  '/product/:productId',
  validateRequest(ProductAnalyticsDTO, true),
  analyticsController.getProductAnalytics
);

analyticsRouter.get(
  '/dashboard/:vendorId',
  analyticsController.getDashboardStats
);

export default analyticsRouter;