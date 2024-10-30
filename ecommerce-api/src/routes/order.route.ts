import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { requireAuth, isVendor } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../dtos/order.dto';


const orderRouter = Router();

// Customer routes
orderRouter.post(
  '/orders',
  requireAuth,
  validateRequest(CreateOrderDTO),
  orderController.createOrder
);

orderRouter.get(
  '/orders/track/:orderId',
  requireAuth,
  orderController.trackOrder
);

// Vendor routes
orderRouter.patch(
  '/orders/vendor/:vendorId/items/:orderItemId',
  requireAuth,
  isVendor,
  validateRequest(UpdateOrderStatusDTO),
  orderController.updateOrderStatus
);

export default orderRouter;