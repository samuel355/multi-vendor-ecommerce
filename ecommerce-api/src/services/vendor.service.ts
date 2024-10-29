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
      await client.query('COMMIT');
      await cache.del('vendors:all');
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
      
    }finally{
      client.release()
    }
  }
}
