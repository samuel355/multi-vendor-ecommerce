import { Request, Response } from 'express';
import vendorService from '../services/vendor.service';
import { CreateVendorDTO, UpdateVendorDTO } from '../dtos/vendor.dto';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class VendorController {
  createVendor = catchAsync(async (req: Request, res: Response) => {
    const vendorData: CreateVendorDTO = req.body;
    const userId = req.auth?.userId;
    const vendor = await vendorService.createVendor(vendorData, userId!);
    ResponseHandler.created(res, vendor, 'Vendor created successfully');
  });

  updateVendor = catchAsync(async (req: Request, res: Response) => {
    const updates: UpdateVendorDTO = req.body;
    const vendorId = req.params.id;
    const userId = req.auth?.userId;
    const vendor = await vendorService.updateVendor(vendorId, userId!, updates);
    ResponseHandler.success(res, vendor, 'Vendor updated successfully');
  });

  getVendor = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    ResponseHandler.success(res, vendor, 'Vendor retrieved successfully');
  });

  getAllVendors = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const vendors = await vendorService.getAllVendors(page, limit);
    ResponseHandler.success(res, vendors, 'Vendors retrieved successfully');
  });

  deleteVendor = catchAsync(async (req: Request, res: Response) => {
    const vendorId = req.params.id;
    const userId = req.auth?.userId;
    await vendorService.deleteVendor(vendorId, userId!);
    ResponseHandler.success(res, null, 'Vendor deleted successfully');
  });
}

export default new VendorController();