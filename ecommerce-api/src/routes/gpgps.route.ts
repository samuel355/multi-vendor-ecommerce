import { Router } from "express";
import { Request, Response } from "express";
import ghanaPostService from "../services/ghanapost.service";
import catchAsync from "../utils/catchAsync";
import ResponseHandler from "../utils/responseHandler";

const gpsRouter = Router();

gpsRouter.post(
  "/validate-address",
  catchAsync(async (req: Request, res: Response) => {
    const { address } = req.body;

    if (!address) {
      return ResponseHandler.error(res, "Address is required", 400);
    }

    const validation = await ghanaPostService.validateAddress(address);
    return ResponseHandler.success(res, validation);
  }),
);

gpsRouter.post(
  "/get-address-details",
  catchAsync(async (req: Request, res: Response) => {
    const { address } = req.body;

    if (!address) {
      return ResponseHandler.error(res, "Address is required", 400);
    }

    const details = await ghanaPostService.getAddressDetails(address);
    if (!details) {
      return ResponseHandler.error(res, "Address not found", 404);
    }

    return ResponseHandler.success(res, details);
  }),
);

gpsRouter.get(
  "/test-connection",
  catchAsync(async (req: Request, res: Response) => {
    const result = await ghanaPostService.testConnection();
    return ResponseHandler.success(res, result);
  }),
);

export default gpsRouter;
