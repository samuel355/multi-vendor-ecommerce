import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";
import ResponseHandler from "../utils/responseHandler";
import { getPool } from "../config/database";

export const webhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();
    const evt = req.body;

    switch (evt.type) {
      case "user.created": {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          phone_numbers,
          image_url,
        } = evt.data;

        const primaryEmail = email_addresses.find(
          (email: any) => email.id === evt.data.primary_email_address_id,
        );

        const query = `
          INSERT INTO users (clerk_id, email, first_name, last_name, phone_number, avatar_url, role)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        const values = [
          id,
          primaryEmail.email_address,
          first_name || "",
          last_name || "",
          phone_numbers?.[0]?.phone_number,
          image_url,
          "user",
        ];

        await pool.query(query, values);

        await clerkClient.users.updateUser(id, {
          publicMetadata: { role: "user" },
        });

        break;
      }

      case "user.updated": {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          phone_numbers,
          image_url,
        } = evt.data;

        const primaryEmail = email_addresses.find(
          (email: any) => email.id === evt.data.primary_email_address_id,
        );

        const query = `
          UPDATE users
          SET email = $1, first_name = $2, last_name = $3, phone_number = $4, avatar_url = $5
          WHERE clerk_id = $6
          RETURNING *
        `;

        const values = [
          primaryEmail.email_address,
          first_name,
          last_name,
          phone_numbers?.[0]?.phone_number,
          image_url,
          id,
        ];

        await pool.query(query, values);
        break;
      }

      case "user.deleted": {
        const query = `
          UPDATE users
          SET is_active = false
          WHERE clerk_id = $1
        `;

        await pool.query(query, [evt.data.id]);
        break;
      }
    }

    return ResponseHandler.success(res, null, "Webhook processed successfully");
  },
);

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();

    const query = `
      SELECT * FROM users
      WHERE clerk_id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [req?.auth?.userId]);

    if (!result.rows[0]) {
      throw ApiError.notFound("User not found");
    }

    return ResponseHandler.success(res, { user: result.rows[0] });
  },
);

export const updateRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();
    const { userId, role } = req.body;

    if (!["user", "vendor", "admin"].includes(role)) {
      throw ApiError.badRequest("Invalid role");
    }

    const query = `
      UPDATE users
      SET role = $1
      WHERE clerk_id = $2 AND is_active = true
      RETURNING *
    `;

    const result = await pool.query(query, [role, userId]);

    if (!result.rows[0]) {
      throw ApiError.notFound("User not found");
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return ResponseHandler.success(
      res,
      { user: result.rows[0] },
      "Role updated successfully",
    );
  },
);

export const listUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();

    const query = `
      SELECT * FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return ResponseHandler.success(res, { users: result.rows });
  },
);
