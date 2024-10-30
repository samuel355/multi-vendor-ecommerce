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
    async (req: Request, res: Response, next: NextFunction) => {
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
    async (req: Request, res: Response, next: NextFunction) => {
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
}
