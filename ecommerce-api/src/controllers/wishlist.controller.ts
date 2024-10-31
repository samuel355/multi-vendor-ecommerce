import { Request, Response } from 'express';
import wishlistService from '../services/wishlist.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class WishlistController {
  addToWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { productId } = req.body;

    const wishlistItem = await wishlistService.addToWishlist(userId!, productId);
    ResponseHandler.success(res, 'Product added to wishlist', wishlistItem);
  });

  removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { productId } = req.params;

    await wishlistService.removeFromWishlist(userId!, productId);
    ResponseHandler.success(res, 'Product removed from wishlist');
  });

  getWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const wishlist = await wishlistService.getWishlist(userId!, page, limit);
    ResponseHandler.success(res, 'Wishlist retrieved successfully', wishlist);
  });

  clearWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    
    await wishlistService.clearWishlist(userId!);
    ResponseHandler.success(res, 'Wishlist cleared successfully');
  });

  checkProduct = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { productId } = req.params;

    const exists = await wishlistService.checkProductInWishlist(userId!, productId);
    ResponseHandler.success(res, { inWishlist: exists }, 'Product check completed');
  });

  moveToCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { productId } = req.params;

    await wishlistService.moveToCart(userId!, productId);
    ResponseHandler.success(res, 'Product moved to cart successfully');
  });
}

export default new WishlistController();