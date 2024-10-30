import { Request, Response } from 'express';
import orderService from '../services/order.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class OrderController {
  createOrder = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const orderData = {
      ...req.body,
      callbackUrl: `${process.env.APP_URL}/api/v1/payments/verify-payment` // Add callback URL
    };
    const result = await orderService.createOrder(userId!, orderData);
    ResponseHandler.success(res, 'Order created successfully', result, 201);
  });

  trackOrder = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.auth?.userId;
    const tracking = await orderService.trackOrder(orderId, userId!);
    ResponseHandler.success(res, 'Order tracking retrieved successfully', tracking);
  });

  updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const { orderItemId } = req.params;
    const vendorId = req.params.vendorId;
    const updateData = req.body;
    await orderService.updateOrderStatus(orderItemId, vendorId, updateData);
    ResponseHandler.success(res, 'Order status updated successfully');
  });
}

export default new OrderController();