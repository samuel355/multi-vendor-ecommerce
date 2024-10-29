import { Pool } from "pg";
import { getPool } from "../config/database";
import { CreateVendorDTO, UpdateVendorDTO } from "../dtos/vendor.dto";
import ApiError from "../utils/apiError";
import { cache } from "../config/redis";

export class VendorService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  //Create vendor
  async createVendor(vendorData: CreateVendorDTO, userId: string) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const vendorQuery = `INSERT INTO vendors(business_name, description, contact_email, phone, address, website, user_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

      const values = [
        vendorData.businessName,
        vendorData.description,
        vendorData.contactEmail,
        vendorData.phone,
        vendorData.address,
        vendorData.website || null,
        userId,
      ];

      const result = await client.query(vendorQuery, values);

      //Update user role to vendor
      await client.query("UPDATE users SET role = $1 WHERE clerk_id = $2", [
        "vendor",
        userId,
      ]);
      await client.query("COMMIT");
      await cache.del("vendors:all");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //Update vendor
  async updateVendor(
    vendorId: string,
    userId: string,
    updates: UpdateVendorDTO,
  ) {
    const setClause = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _], index) => `${this.camelToSnake(key)} = $${index + 1}`)
      .join(", ");

    const values = Object.values(updates).filter(
      (value) => value !== undefined,
    );
    values.push(vendorId, userId);

    const query = `
        UPDATE vendors
        SET ${setClause}
        WHERE id = $${values.length - 1} AND user_id = $${values.length}
        RETURNING *
      `;

    const result = await this.pool.query(query, values);
    if (!result.rows[0]) {
      throw ApiError.notFound("Vendor not found");
    }

    await cache.del(`vendor:${vendorId}`);
    await cache.del("vendors:all");
    return result.rows[0];
  }

  //Get Vendor by id
  async getVendorById(vendorId: string) {
    const cached = await cache.get(`vendor:${vendorId}`);
    if (cached) return cached;

    const query = ` SELECT v.*, u.email, u.full_name
      FROM vendors v
      JOIN users u ON v.user_id=u.clerk_id
      WHERE v.id=$1 AND v.is_active=true`;
    
    const result = await this.pool.query(query, [vendorId]);
    if(!result.rows[0]){
      throw ApiError.notFound('Vendor not found');
    }
    
    await cache.set(`vendor:${vendorId}`, result.rows[0], 3600);
    return result.rows[0];
  }
}
