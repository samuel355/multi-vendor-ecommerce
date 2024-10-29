import { Pool } from "pg";
import { getPool } from "../config/database";
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterDTO,
} from "../dtos/product.dto";
import ApiError from "../utils/apiError";
import { cache } from "../config/redis";
import logger from "../config/logger";

export class ProductService {
  private pool: Pool;
  private readonly CACHE_TTL = 3600; // 1 hour

  private async clearProductCaches(vendorId: string) {
    try {
      await cache.del(`vendor:${vendorId}:products`);
      await cache.del("products:all");
      // Could add more specific cache clearing if needed
    } catch (error) {
      logger.error("Error clearing product caches:", error);
    }
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  // Create Product
  async createProduct(
    productData: CreateProductDTO,
    vendorId: string,
    userId: string,
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      //check if user is associated with vendor
      const vendorCheck = await client.query(
        "SELECT id FROM vendors WHERE id = $1 AND user_id = $2",
        [vendorId, userId],
      );

      if (!vendorCheck.rows[0]) {
        throw ApiError.forbidden(
          "Not authorized to create products for this vendor",
        );
      }

      const productQuery = `INSERT INTO products(
        name, description, price, quantity, categories, images, brand, sku,
        featured, discount_percentage, vendor_id
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

      const values = [
        productData.name,
        productData.description,
        productData.images,
        productData.price,
        productData.quantity,
        productData.categories,
        productData.brand,
        productData.sku,
        productData.featured || false,
        productData.discountPercentage || 0,
        vendorId,
      ];

      const result = await client.query(productQuery, values);
      await client.query("COMMIT");

      //Clear caches
      await this.clearProductCaches(vendorId);
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //Update Product
  async updateProduct(
    productId: string,
    vendorId: string,
    userId: string,
    updates: UpdateProductDTO,
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      //check if product exits and it belongs to vendor
      const productCheck = await client.query(
        `SELECT p.*, FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.id = $1 AND v.id = $2 AND v.user_id = $3`,
        [productId, vendorId, userId],
      );

      if (!productCheck.rows[0]) {
        throw ApiError.notFound("Product not found or you not authorized");
      }

      //generate an SQL SET clause and corresponding values array for a database update query:
      // "first_name = $1, age = $2"
      const setClause = Object.entries(updates)
        .filter(([_, value]) => value !== undefined)
        .map(([key, _], index) => `${this.camelToSnake(key)} = $${index + 1}`)
        .join(", ");

      const values = Object.values(updates).filter(
        (value) => value !== undefined,
      );
      values.push(productId);

      const query = `
        UPDATE products
        SET ${setClause}, updated_at=CURRENT_TIMESTAMP
        WHERE id=${values.length}
        RETURNING *`;

      const result = await client.query(query, values);
      await client.query("COMMIT");

      //Clear relevant caches
      await this.clearProductCaches(vendorId);

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //Get product by Id
  async getProductById(productId: string) {
    const cacheKey = `product:${productId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT p.*, v.business_name as vendor_name, v.id as vendor_id
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = $1 AND p.is_active = true`;

    const result = await this.pool.query(query, [productId]);
    if (!result.rows[0]) {
      throw ApiError.notFound("Product not found");
    }

    await cache.set(cacheKey, result.rows[0], this.CACHE_TTL);
    return result.rows[0];
  }

  //Get all products
  async getProducts(
    filters: ProductFilterDTO,
    page: number = 1,
    limit: number = 20,
  ) {
    // - Creates a unique cache key based on filters and pagination
    // - Returns cached results if available
    const offset = (page - 1) * limit;
    const cachedKey = `products:${JSON.stringify(filters)}:${page}:${limit}`;
    const cached = await cache.get(cachedKey);
    if (cached) return cached;

    //Search filters Builds
    // - Supports multiple filter types:
    //   - Text search (name, description, brand)
    //   - Categories
    //   - Price range
    //   - Brand
    //   - Featured status
    //   - Vendor ID

    let whereConditions = ["p.is_active =true"];
    let values: any[] = [];
    let paramCount = 1;

    if (filters.search) {
      whereConditions.push(`
        (p.name ILIKE $${paramCount} OR
        p.description ILIKE $${paramCount} OR
        p.brand ILIKE $${paramCount})
      `);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.categories) {
      whereConditions.push(`p.categories && $${paramCount}::text[]`);
      values.push(filters.categories);
      paramCount++;
    }

    if (filters.minPrice !== undefined) {
      whereConditions.push(`p.price >= $${paramCount}`);
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice !== undefined) {
      whereConditions.push(`p.price <= $${paramCount}`);
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.brand) {
      whereConditions.push(`p.brand = $${paramCount}`);
      values.push(filters.brand);
      paramCount++;
    }

    if (filters.featured !== undefined) {
      whereConditions.push(`p.featured = $${paramCount}`);
      values.push(filters.featured);
      paramCount++;
    }

    if (filters.vendorId) {
      whereConditions.push(`p.vendor_id = $${paramCount}`);
      values.push(filters.vendorId);
      paramCount++;
    }

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    const query = `
      SELECT p.*, v.business_name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);

    // Count
    const countQuery = `
      SELECT COUNT(*)
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      ${whereClause}
    `;

    const [products, count] = await Promise.all([
      this.pool.query(query, values),
      this.pool.query(countQuery, values.slice(0, -2)),
    ]);

    //- Gets total number of matching products for pagination
    const result = {
      products: products.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
    };

    //- Stores results in cache for future requests for 1 hour
    await cache.set(cachedKey, result, this.CACHE_TTL);
    return result;
  }

  //Delete Product
  async deleteProduct(productId: string, vendorId: string, userId: string) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE products
         SET is_active = false
         WHERE id = $1 AND vendor_id = $2
         AND EXISTS (
           SELECT 1 FROM vendors
           WHERE id = $2 AND user_id = $3
         )
         RETURNING *`,
        [productId, vendorId, userId],
      );
      
      if (!result.rows[0]) {
        throw ApiError.notFound('Product not found or not authorized');
      }

      await client.query('COMMIT');
      
      // Clear relevant caches
      await this.clearProductCaches(vendorId);
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }finally{
      client.release()
    }
  }
  
}

export default new ProductService();
