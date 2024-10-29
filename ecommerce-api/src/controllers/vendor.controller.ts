import { Request, Response, NextFunction } from 'express';
import vendorService from '../services/vendor.service';
import { CreateVendorDTO, UpdateVendorDTO } from '../dtos/vendor.dto';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class VendorController {
  //Create Vendor Controller
  createVendor = catchAsync(async (req: Request, res: Response) => {
    const vendorData: CreateVendorDTO = req.body;
    const userId = req.auth?.userId;
    const vendor = await vendorService.createVendor(vendorData, userId!);
    ResponseHandler.success(res, 'Vendor created successfully', vendor, 201);
  });

  //Update Vendor Controller
  updateVendor = catchAsync(async (req: Request, res: Response) => {
    const updates: UpdateVendorDTO = req.body;
    const vendorId = req.params.id;
    const userId = req.auth?.userId;
    const vendor = await vendorService.updateVendor(vendorId, userId!, updates);
    ResponseHandler.success(res, 'Vendor updated successfully', vendor);
  });

  //GetVendor Controller
  getVendor = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    ResponseHandler.success(res, 'Vendor retrieved successfully', vendor);
  });

  //GetAllVendors Controller
  getAllVendors = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const vendors = await vendorService.getAllVendors(page, limit);
    ResponseHandler.success(res, 'Vendors retrieved successfully', vendors);
  });

  //Delete Vendor Controller
  deleteVendor = catchAsync(async (req: Request, res: Response) => {
    const vendorId = req.params.id;
    const userId = req.auth?.userId;
    await vendorService.deleteVendor(vendorId, userId!);
    ResponseHandler.success(res, 'Vendor deleted successfully');
  });
}

export default new VendorController();