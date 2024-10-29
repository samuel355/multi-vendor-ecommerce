//middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import ResponseHandler from '../utils/responseHandler';
import logger from '../config/logger';

export const errorHandler = (
  error: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof ApiError) {
    ResponseHandler.error(
      res,
      error.message,
      error.statusCode
    );
    return;
  }

  // Handle unexpected errors
  logger.error(error);
  ResponseHandler.error(
    res,
    'Internal server error',
    500
  );
};