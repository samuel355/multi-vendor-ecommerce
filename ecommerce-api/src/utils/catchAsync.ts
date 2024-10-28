import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;


// Example 1: Basic Route Handler
// const getUserById = catchAsync(async (req: Request, res: Response) => {
//   const user = await User.findById(req.params.id);
//   if (!user) {
//     throw ApiError.notFound("User not found");
//   }
//   res.json(user);
// });