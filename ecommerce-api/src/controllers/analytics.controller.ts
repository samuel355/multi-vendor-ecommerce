import { Request, Response } from 'express';
import analyticsService from '../services/analytics.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';
import { TimeFrame } from '../dtos/analytics.dto';

export class AnalyticsController {
  getVendorAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const { timeframe, startDate, endDate } = req.query;

    const analytics = await analyticsService.getVendorAnalytics(
      vendorId,
      timeframe as TimeFrame,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    ResponseHandler.success(res, 'Analytics retrieved successfully', analytics);
  });

  getProductAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { timeframe } = req.query;

    const analytics = await analyticsService.getProductAnalytics(
      productId,
      timeframe as TimeFrame
    );

    ResponseHandler.success(res, 'Product analytics retrieved successfully', analytics);
  });

  getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;

    const stats = await analyticsService.getDashboardStats(vendorId);
    ResponseHandler.success(res, 'Dashboard stats retrieved successfully', stats);
  });
}

export default new AnalyticsController();