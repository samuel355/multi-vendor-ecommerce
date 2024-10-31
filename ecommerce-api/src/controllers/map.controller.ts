import { Request, Response } from "express";
import { Pool } from "pg";
import { getPool } from "../config/database";
import locationService from "../services/location.service";
import ResponseHandler from "../utils/responseHandler";
import catchAsync from "../utils/catchAsync";

export class MapController {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  getNearbyVendors = catchAsync(async (req: Request, res: Response) => {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km

    const query = `
      SELECT
        v.*,
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)
        ) * 111.319 as distance
      FROM vendors v
      WHERE v.is_active = true
      AND v.location_verified = true
      HAVING ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)
      ) * 111.319 <= $3
      ORDER BY distance
    `;

    const result = await this.pool.query(query, [longitude, latitude, radius]);

    ResponseHandler.success(
      res,
      result.rows,
      "Nearby vendors retrieved successfully",
    );
  });

  updateVendorLocation = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const { digitalAddress } = req.body;

    const coordinates =
      await locationService.convertDigitalAddress(digitalAddress);

    const query = `
      UPDATE vendors
      SET
        digital_address = $1,
        latitude = $2,
        longitude = $3,
        location_verified = true
      WHERE id = $4
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      digitalAddress,
      coordinates.latitude,
      coordinates.longitude,
      vendorId,
    ]);

    ResponseHandler.success(
      res,
      "Vendor location updated successfully",
      result.rows[0],
    );
  });
}

export default new MapController();
