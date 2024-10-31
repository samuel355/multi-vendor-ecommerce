import { Request, Response } from 'express';
import reviewService from '../services/review.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class ReviewController {
  createReview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { productId, orderId, rating, comment, images } = req.body;

    const review = await reviewService.createReview({
      userId: userId!,
      productId,
      orderId,
      rating,
      comment,
      images
    });

    ResponseHandler.success(res, review, 'Review created successfully');
  });

  getProductReviews = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const reviews = await reviewService.getProductReviews(productId, page, limit);
    ResponseHandler.success(res, 'Reviews retrieved successfully', reviews);
  });

  getUserReviews = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const reviews = await reviewService.getUserReviews(userId!, page, limit);
    ResponseHandler.success(res, reviews, 'User reviews retrieved successfully');
  });

  deleteReview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { reviewId } = req.params;

    await reviewService.deleteReview(reviewId, userId!);
    ResponseHandler.success(res, 'Review deleted successfully');
  });
}

export default new ReviewController();