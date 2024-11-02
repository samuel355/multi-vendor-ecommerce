import { Router } from 'express';
import productController from '../controllers/product.controller';
import { requireAuth, isVendor, isOwnerOrAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';
import { checkProductLimit } from '../middleware/subscription.middleware';
import { cache } from '../config/redis';
import rateLimit from 'express-rate-limit';
import { getPool } from '../config/database';
import { checkActiveSubscription } from '../middleware/subscriptionCheck.middleware';

const productRouter = Router();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Cache middleware
const cacheProducts = async (req: any, res: any, next: any) => {
  try {
    const cacheKey = `products:${req.originalUrl}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Public routes with rate limiting and caching
productRouter.get(
  '', 
  apiLimiter,
  cacheProducts,
  productController.getProducts
);

productRouter.get(
  '/:productId', 
  apiLimiter,
  cacheProducts,
  productController.getProduct
);

productRouter.get(
  '/vendor/:vendorId', 
  apiLimiter,
  cacheProducts,
  productController.getVendorProducts
);

// Protected routes
// Apply authentication and vendor check for all vendor routes
productRouter.use('/vendor/:vendorId', requireAuth, isVendor, checkActiveSubscription);

// Create product - check subscription limit
productRouter.post(
  '/vendor/:vendorId',
  checkProductLimit, // Check if vendor has reached their product limit
  validateRequest(CreateProductDTO),
  productController.createProduct
);

// Update product - check ownership
productRouter.put(
  '/vendor/:vendorId/:productId',
  isOwnerOrAdmin('product'), // Ensure vendor owns the product or is admin
  validateRequest(UpdateProductDTO),
  productController.updateProduct
);

// Delete product - check ownership
productRouter.delete(
  '/vendor/:vendorId/:productId',
  isOwnerOrAdmin('product'), // Ensure vendor owns the product or is admin
  productController.deleteProduct
);

// Add middleware to check for active subscription


export default productRouter;