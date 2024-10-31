import { Router } from 'express';
import promotionController from '../controllers/promotion.controller';
import { requireAuth, isVendor } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreatePromotionDTO, UpdatePromotionDTO } from '../dtos/promotion.dto';

const promotionRouter = Router();

// Public routes (for customers to view active promotions)
promotionRouter.get(
  '/active',
  promotionController.getActivePromotions
);

// Protected routes
promotionRouter.use(requireAuth);

// Customer routes
promotionRouter.post(
  '/apply',
  promotionController.applyPromotion
);

promotionRouter.get(
  '/check-eligibility',
  promotionController.checkEligibility
);

// Vendor routes
promotionRouter.use('/vendor/:vendorId', requireAuth, isVendor);

promotionRouter.post(
  '/',
  validateRequest(CreatePromotionDTO),
  promotionController.createPromotion
);

promotionRouter.put(
  '/:promotionId',
  validateRequest(UpdatePromotionDTO),
  promotionController.updatePromotion
);

promotionRouter.get(
  '/',
  promotionController.getVendorPromotions
);

promotionRouter.get(
  '/:promotionId',
  promotionController.getPromotion
);

promotionRouter.get(
  '/:promotionId/stats',
  promotionController.getPromotionStats
);

export default promotionRouter;