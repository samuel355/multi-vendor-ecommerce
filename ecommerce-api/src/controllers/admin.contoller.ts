import { Request, Response } from "express";
import adminService from "../services/admin.service";
import ResponseHandler from "../utils/responseHandler";
import catchAsync from "../utils/catchAsync";
import {
  AdminVendorFilterDTO,
  UpdateVendorStatusDTO,
  CreateAnnouncementDTO,
} from "../dtos/admin.dto";

export class AdminController {
  getVendorAnalytics = catchAsync(async (req: Request, res: Response) => {
    const analytics = await adminService.getVendorAnalytics();
    ResponseHandler.success(
      res,
      "Vendor analytics retrieved successfully",
      analytics,
    );
  });

  getVendors = catchAsync(async (req: Request, res: Response) => {
    const filters: AdminVendorFilterDTO = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const vendors = await adminService.getVendors(filters, page, limit);
    ResponseHandler.success(res, vendors, "Vendors retrieved successfully");
  });

  updateVendorStatus = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const updateData: UpdateVendorStatusDTO = req.body;
    const vendor = await adminService.updateVendorStatus(vendorId, updateData);
    ResponseHandler.success(res, "Vendor status updated successfully", vendor);
  });

  createAnnouncement = catchAsync(async (req: Request, res: Response) => {
    const announcementData: CreateAnnouncementDTO = req.body;
    const announcement =
      await adminService.createAnnouncement(announcementData);
    ResponseHandler.success(
      res,
      "Announcement created successfully",
      announcement,
    );
  });

  getVendorMetrics = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const metrics = await adminService.getVendorPerformanceMetrics(vendorId);
    ResponseHandler.success(
      res,
      "Vendor metrics retrieved successfully",
      metrics,
    );
  });
}

export default new AdminController();
