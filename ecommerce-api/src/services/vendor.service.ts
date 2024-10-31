import { Pool } from "pg";
import { getPool } from "../config/database";
import { CreateVendorDTO, UpdateVendorDTO } from "../dtos/vendor.dto";
import ApiError from "../utils/apiError";
import { cache } from "../config/redis";
import ghanaPostService from "../services/ghanapost.service";

interface OpeningHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface VendorLocation {
  latitude: number;
  longitude: number;
}

interface OperatingHours {
  [key: string]: OpeningHours;
}

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
    if (!result.rows[0]) {
      throw ApiError.notFound("Vendor not found");
    }

    await cache.set(`vendor:${vendorId}`, result.rows[0], 3600);
    return result.rows[0];
  }

  //Get all vendors
  async getAllVendors(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const cached = await cache.get("vendors:all");
    if (cached) return cached;

    const query = `
      SELECT v.*, u.email, u.full_name
      FROM vendors v
      JOIN users u ON v.user_id = u.clerk_id
      WHERE v.is_active = true
      ORDER BY v.created_at DESC
      LIMIT $1 OFFSET $2`;

    const countQuery = `
      SELECT COUNT(*)
      FROM vendors
      WHERE is_active = true
    `;

    const [vendors, count] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery),
    ]);

    const result = {
      vendors: vendors.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
    };

    await cache.set("vendors:all", result, 3600);
    return result;
  }

  //Delete Vendor
  async deleteVendor(vendorId: string, userId: string) {
    const query = `
      UPDATE vendors
      SET is_active = false
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [vendorId, userId]);
    if (!result.rows[0]) {
      throw ApiError.notFound('Vendor not found');
    }
    
    await cache.del(`vendor:${vendorId}`);
    await cache.del('vendors:all');
    return result.rows[0];
  }
  
  //Update Vendor location
  async updateVendorLocation(
    vendorId: string,
    userId: string,
    data: {
      digitalAddress: string;
      shopImages?: string[];
      openingHours?: OperatingHours;
      shopCategory?: string;
      shopTags?: string[];
    }
  ) {
    const client = await this.pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Get address details
      const addressDetails = await ghanaPostService.getAddressDetails(data.digitalAddress);
      if (!addressDetails) {
        throw new ApiError(400, 'Invalid digital address');
      }
  
      const updateQuery = `
        UPDATE vendors 
        SET 
          digital_address = $1,
          latitude = $2,
          longitude = $3,
          shop_images = $4,
          opening_hours = $5,
          shop_category = $6,
          shop_tags = $7,
          location_verified = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND user_id = $9
        RETURNING *
      `;
  
      const result = await client.query(updateQuery, [
        data.digitalAddress,
        addressDetails.coordinates.latitude,
        addressDetails.coordinates.longitude,
        data.shopImages || [],
        JSON.stringify(data.openingHours || {}),
        data.shopCategory,
        data.shopTags || [],
        vendorId,
        userId
      ]);
  
      // Update operating hours if provided
      if (data.openingHours) {
        await this.updateOperatingHours(client, vendorId, data.openingHours);
      }
  
      await client.query('COMMIT');
      await this.clearVendorCache(vendorId);
  
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  //Get Nearby Vendors
  async getNearbyVendors(
    latitude: number,
    longitude: number,
    radius: number = 5, // km
    category?: string
  ) {
    const cacheKey = `nearby:${latitude}:${longitude}:${radius}:${category || 'all'}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
  
    const params: (number | string)[] = [latitude, longitude, radius];
    
    // Using Haversine formula to calculate distance
    const query = `
      SELECT 
        v.*,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) AS distance
      FROM vendors v
      WHERE 
        v.is_active = true
        AND v.location_verified = true
        ${category ? 'AND v.shop_category = $4' : ''}
      HAVING 
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) < $3
      ORDER BY distance
    `;
  
    if (category) {
      params.push(category);
    }
  
    const result = await this.pool.query(query, params);
    
    const vendors = result.rows.map(vendor => ({
      ...vendor,
      distance: Math.round(vendor.distance * 100) / 100 // Round to 2 decimal places
    }));
  
    await cache.set(cacheKey, JSON.stringify(vendors), 300); // Cache for 5 minutes
    return vendors;
  }
  
  //Add shop Reviews
  async addShopReview(
    vendorId: string,
    userId: string,
    data: {
      rating: number;
      reviewText?: string;
      images?: string[];
    }
  ) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user has made a purchase from this vendor
      const purchaseCheck = `
        SELECT EXISTS (
          SELECT 1 FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE oi.vendor_id = $1 
          AND o.user_id = $2 
          AND oi.status = 'delivered'
        ) as has_purchased
      `;

      const { has_purchased } = (await client.query(purchaseCheck, [vendorId, userId])).rows[0];

      // Insert review
      const reviewQuery = `
        INSERT INTO shop_reviews (
          vendor_id, user_id, rating, review_text, 
          images, is_verified_purchase
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const review = await client.query(reviewQuery, [
        vendorId,
        userId,
        data.rating,
        data.reviewText,
        data.images || [],
        has_purchased
      ]);

      // Update vendor rating
      await client.query(`
        UPDATE vendors 
        SET 
          average_rating = (
            SELECT AVG(rating) FROM shop_reviews 
            WHERE vendor_id = $1
          ),
          total_ratings = (
            SELECT COUNT(*) FROM shop_reviews 
            WHERE vendor_id = $1
          )
        WHERE id = $1
      `, [vendorId]);

      await client.query('COMMIT');
      await this.clearVendorCache(vendorId);

      return review.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  //Update Operating hours
  private async updateOperatingHours(
    client: any, 
    vendorId: string, 
    hours: OperatingHours
  ) {
    // Clear existing hours
    await client.query(
      'DELETE FROM vendor_operating_hours WHERE vendor_id = $1',
      [vendorId]
    );
  
    // Insert new hours
    for (const [day, times] of Object.entries(hours)) {
      await client.query(`
        INSERT INTO vendor_operating_hours (
          vendor_id, day_of_week, open_time, 
          close_time, is_closed
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        vendorId,
        day,
        times.open,
        times.close,
        times.closed || false
      ]);
    }
  }

  private async clearVendorCache(vendorId: string) {
    await Promise.all([
      cache.del(`vendor:${vendorId}`),
      cache.del('vendors:nearby:*'),
      cache.del('vendors:all')
    ]);
  }
}

export default new VendorService();