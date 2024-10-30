import { Router } from 'express';
import productController from '../controllers/product.controller';
import { requireAuth, isVendor } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';

const productRouter = Router();

//public routes
productRouter.get('/products', productController.getProducts);
productRouter.get('/products/:productId', productController.getProduct);
productRouter.get('/products/vendor/:vendorId', productController.getVendorProducts);

// Protected routes (require authentication and vendor role)
productRouter.use(requireAuth, isVendor);

productRouter.post(
  '/products/vendor/:vendorId',
  validateRequest(CreateProductDTO),
  productController.createProduct
);

productRouter.put(
  '/products/vendor/:vendorId/:productId',
  validateRequest(UpdateProductDTO),
  productController.updateProduct
);

productRouter.delete(
  '/products/vendor/:vendorId/:productId',
  productController.deleteProduct
);

export default productRouter;