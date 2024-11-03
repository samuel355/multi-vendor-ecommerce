import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";
import ResponseHandler from "../utils/responseHandler";
import { getPool } from "../config/database";

// Update the interface to match Clerk's actual webhook payload
interface ClerkWebhookEvent {
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: Array<{
      id: string;
      email_address: string;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    primary_email_address_id: string;
    phone_numbers: Array<{
      id: string;
      phone_number: string;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    image_url: string;
    created_at: number;
    updated_at: number;
  };
  object: string;
  type: string;
}

export const webhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();
    const evt = req.body;

    // Validate webhook payload
    if (!evt.data || !evt.type) {
      throw ApiError.badRequest('Invalid webhook payload');
    }

    try {
      switch (evt.type) {
        case "user.created": {
          const {
            id,
            email_addresses,
            first_name,
            last_name,
            phone_numbers,
            image_url,
            primary_email_address_id
          } = evt.data;

          // Find primary email with null check
          const primaryEmail = email_addresses?.find(
            email => email.id === primary_email_address_id
          );

          if (!primaryEmail) {
            throw ApiError.badRequest('No primary email found');
          }

          const query = `
            INSERT INTO users (
              clerk_id, 
              email, 
              first_name, 
              last_name, 
              phone_number, 
              avatar_url, 
              role,
              is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (clerk_id) 
            DO UPDATE SET
              email = EXCLUDED.email,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              phone_number = EXCLUDED.phone_number,
              avatar_url = EXCLUDED.avatar_url
            RETURNING *
          `;

          const values = [
            id,
            primaryEmail.email_address,
            first_name || '',
            last_name || '',
            phone_numbers?.[0]?.phone_number || null,
            image_url || null,
            'user',
            true
          ];

          const result = await pool.query(query, values);

          // Update Clerk user metadata
          await clerkClient.users.updateUser(id, {
            publicMetadata: { 
              role: 'user',
              userId: result.rows[0].id
            }
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
            primary_email_address_id
          } = evt.data;

          const primaryEmail = email_addresses?.find(
            email => email.id === primary_email_address_id
          );

          if (!primaryEmail) {
            throw ApiError.badRequest('No primary email found');
          }

          const query = `
            UPDATE users
            SET 
              email = $1,
              first_name = $2,
              last_name = $3,
              phone_number = $4,
              avatar_url = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE clerk_id = $6
            RETURNING *
          `;

          const values = [
            primaryEmail.email_address,
            first_name || '',
            last_name || '',
            phone_numbers?.[0]?.phone_number || null,
            image_url || null,
            id
          ];

          await pool.query(query, values);
          break;
        }

        case "user.deleted": {
          const query = `
            UPDATE users
            SET 
              is_active = false,
              updated_at = CURRENT_TIMESTAMP
            WHERE clerk_id = $1
            RETURNING *
          `;

          await pool.query(query, [evt.data.id]);
          break;
        }

        default: {
          // Log unhandled event types
          console.log(`Unhandled webhook event type: ${evt.type}`);
        }
      }

      return ResponseHandler.success(
        res, 
        { status: 'success' }, 
        "Webhook processed successfully"
      );

    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }
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
