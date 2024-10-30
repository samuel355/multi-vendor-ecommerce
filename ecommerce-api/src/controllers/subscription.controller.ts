import { CreateSubscriptionDTO } from "../dtos/subscription.dto";
import subscriptionService from "../services/subscription.service";
import catchAsync from "../utils/catchAsync";
import { Request, Response } from "express";
import ResponseHandler from "../utils/responseHandler";

export class SubscriptionController {
  //Initiate Subscription 
  initiateSubscription = catchAsync(async (req: Request, res: Response) => {
    const vendorId = req.params.vendorId;
    const subscriptionData: CreateSubscriptionDTO = req.body;
    const result = await subscriptionService.initiateSubscription(
      vendorId,
      subscriptionData,
    );
    ResponseHandler.success(res, "Subscription initiated successfully", result);
  });
  
  //Verify Subscription
  verifySubscription = catchAsync(async (req: Request, res: Response) => {
    const { reference } = req.query;
    const result = await subscriptionService.verifySubscriptionPayment(reference as string);
    ResponseHandler.success(res, 'Subscription verified successfully', result);
  });
  
  //Admin Get All subscriptions
  getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const subscriptionsData = await subscriptionService.getAllSubscriptions(page, limit);
    
    ResponseHandler.success(
      res, 
      'Subscriptions retrieved successfully', 
      subscriptionsData
    );
  });
  
  //Get Subscription Stats
  getSubscriptionStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await subscriptionService.getSubscriptionStats();
    ResponseHandler.success(res, 'Subscription stats retrieved successfully', stats);
  });
}

export default new SubscriptionController();