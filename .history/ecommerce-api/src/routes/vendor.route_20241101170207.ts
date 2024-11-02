import { Router } from "express";
import vendorController from "../controllers/vendor.controller";
import {
  requireAuth,
  isVendor,
  isOwnerOrAdmin,
} from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validateRequest.middleware";
import { CreateVendorDTO, UpdateVendorDTO } from "../dtos/vendor.dto";

const vendorRouter = Router();

//Create Vendor Route
vendorRouter.post(
  "/create-vendor",
  requireAuth,
  validateRequest(CreateVendorDTO),
  vendorController.createVendor,
);

//Update Vendor
vendorRouter.put(
  "/:id",
  requireAuth,
  isOwnerOrAdmin("vendor"),
  validateRequest(UpdateVendorDTO),
  vendorController.updateVendor,
);

//Get Vendor by Id
vendorRouter.get("vendor/:id", vendorController.getVendor);

//Delete Vendor
vendorRouter.delete(
  "/delete/:id",
  requireAuth,
  isOwnerOrAdmin("vendor"),
  vendorController.deleteVendor,
);

export default vendorRouter;