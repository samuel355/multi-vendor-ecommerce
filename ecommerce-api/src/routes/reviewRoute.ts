import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { CreateReviewDTO, GetReviewsQueryDTO } from '../dtos/review.dto';

const reviewRouter = Router();

// Public routes
reviewRouter.get(
  '/product/:productId',
  validateRequest(GetReviewsQueryDTO, true),
  reviewController.getProductReviews
);

// Protected routes
reviewRouter.use(requireAuth);

reviewRouter.post(
  '/',
  validateRequest(CreateReviewDTO),
  reviewController.createReview
);

reviewRouter.get(
  '/user',
  validateRequest(GetReviewsQueryDTO, true),
  reviewController.getUserReviews
);

reviewRouter.delete(
  '/:reviewId',
  reviewController.deleteReview
);

export default reviewRouter;