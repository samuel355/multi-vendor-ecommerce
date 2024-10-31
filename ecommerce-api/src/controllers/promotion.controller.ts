import { Request, Response } from 'express';
import promotionService from '../services/promotion.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class PromotionController {
  createPromotion = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const promotionData = req.body;

    const promotion = await promotionService.createPromotion(vendorId, promotionData);
    ResponseHandler.success(res,  promotion, 'Promotion created successfully');
  });

  updatePromotion = catchAsync(async (req: Request, res: Response) => {
    const { vendorId, promotionId } = req.params;
    const updates = req.body;

    const promotion = await promotionService.updatePromotion(
      promotionId,
      vendorId,
      updates
    );
    ResponseHandler.success(res, 'Promotion updated successfully', promotion);
  });

  getPromotion = catchAsync(async (req: Request, res: Response) => {
    const { promotionId } = req.params;

    const promotion = await promotionService.getPromotion(promotionId);
    ResponseHandler.success(res, 'Promotion retrieved successfully', promotion);
  });

  // Add this method
  getActivePromotions = catchAsync(async (req: Request, res: Response) => {
    const filters = {
      vendorId: req.query.vendorId as string,
      category: req.query.category as string,
      minPurchase: req.query.minPurchase 
        ? parseFloat(req.query.minPurchase as string) 
        : undefined
    };

    const promotions = await promotionService.getActivePromotions(filters);
    ResponseHandler.success(res, promotions, 'Active promotions retrieved successfully');
  });

  getVendorPromotions = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const promotions = await promotionService.getVendorPromotions(
      vendorId,
      page,
      limit
    );
    ResponseHandler.success(res, 'Promotions retrieved successfully', promotions);
  });

  applyPromotion = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { promotionId, orderId } = req.body;

    const result = await promotionService.validateAndApplyPromotion(
      promotionId,
      orderId,
      userId!
    );
    ResponseHandler.success(res,result, 'Promotion applied successfully');
  });

  // Add method to get promotion statistics
  getPromotionStats = catchAsync(async (req: Request, res: Response) => {
    const { promotionId } = req.params;
    
    const stats = await promotionService.getPromotionStatistics(promotionId);
    ResponseHandler.success(res, 'Promotion statistics retrieved successfully', stats);
  });

  // Add method to check promotion eligibility
  checkEligibility = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { promotionId, orderId } = req.query;

    const eligibility = await promotionService.checkPromotionEligibility(
      promotionId as string,
      userId!,
      orderId as string
    );
    ResponseHandler.success(res, eligibility, 'Eligibility check completed');
  });
}

export default new PromotionController();