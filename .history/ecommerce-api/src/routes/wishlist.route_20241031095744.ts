import { Router } from 'express';
import wishlistController from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { AddToWishlistDTO, WishlistQueryDTO } from '../dtos/wishlist.dto';

const wishlistRouter = Router();

// All wishlist routes require authentication
wishlistRouter.use(requireAuth);

wishlistRouter.post(
  '/',
  validateRequest(AddToWishlistDTO),
  wishlistController.addToWishlist
);

wishlistRouter.get(
  '/',
  validateRequest(WishlistQueryDTO, true),
  wishlistController.getWishlist
);

wishlistRouter.delete(
  '/clear',
  wishlistController.clearWishlist
);

wishlistRouter.delete(
  '/:productId',
  wishlistController.removeFromWishlist
);

wishlistRouter.get(
  '/check/:productId',
  wishlistController.checkProduct
);

wishlistRouter.post(
  '/:productId/move-to-cart',
  wishlistController.moveToCart
);

export default wishlistRouter;