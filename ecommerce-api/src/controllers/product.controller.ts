import { NextFunction, Request, Response } from "express";
import productService from "../services/product.service";
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterDTO,
} from "../dtos/product.dto";
import ResponseHandler from "../utils/responseHandler";
import catchAsync from "../utils/catchAsync";

export class ProductController {
  //Create product Controller
  createProduct = catchAsync(
    async (req: Request, res: Response) => {
      const productData: CreateProductDTO = req.body;
      const vendorId = req.params.vendorId;
      const userId = req.auth?.userId;
      const product = await productService.createProduct(
        productData,
        vendorId,
        userId!,
      );
      ResponseHandler.success(
        res,
        "Product Created Successfully",
        product,
        201,
      );
    },
  );

  //Update Product
  updateProduct = catchAsync(
    async (req: Request, res: Response) => {
      const updates: UpdateProductDTO = req.body;
      const productId = req.params.productId;
      const vendorId = req.params.vendorId;
      const userId = req.auth?.userId;
      const product = await productService.updateProduct(
        productId,
        vendorId,
        userId!,
        updates,
      );
      ResponseHandler.success(res, "Product updated successfully", product);
    },
  );

  //Get Product By Id
  getProduct = catchAsync(
    async (req: Request, res: Response) => {
      const product = await productService.getProductById(req.params.productId);
      ResponseHandler.success(res, "Product retrieved successfully", product);
    },
  );
  
  //Get Products
  getProducts = catchAsync(async (req: Request, res: Response) => {
    const filters: ProductFilterDTO = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const products = await productService.getProducts(filters, page, limit);
    ResponseHandler.success(res, 'Products retrieved successfully', products);
  });

  //Get Vendor Products
  getVendorProducts = catchAsync(async (req: Request, res: Response) => {
    const vendorId = req.params.vendorId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters: ProductFilterDTO = { ...req.query, vendorId };
    const products = await productService.getProducts(filters, page, limit);
    ResponseHandler.success(res, 'Vendor products retrieved successfully', products);
  });
  
  //Delete Product
  deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const vendorId = req.params.vendorId;
    const userId = req.auth?.userId;
    await productService.deleteProduct(productId, vendorId, userId!);
    ResponseHandler.success(res, 'Product deleted successfully');
  });
}
