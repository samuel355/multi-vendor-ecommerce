import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";
import ResponseHandler from "../utils/responseHandler";
import { getPool } from "../config/database";

// Update the interface to match Clerk's actual webhook payload
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      id: string;
      email_address: string;
      verification: {
        status: string;
      };
    }>;
    phone_numbers: Array<{
      id: string;
      phone_number: string;
      verification: {
        status: string;
      };
    }>;
    username?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    primary_email_address_id: string;
    primary_phone_number_id?: string;
    public_metadata?: {
      role?: string;
    };
  };
}

export const webhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();
    const evt = req.body as ClerkWebhookEvent;

    // Validate webhook payload
    if (!evt || !evt.type || !evt.data) {
      throw ApiError.badRequest("Invalid webhook payload");
    }

    try {
      switch (evt.type) {
        case "user.created": {
          const {
            id,
            email_addresses,
            phone_numbers,
            username,
            first_name,
            last_name,
            image_url,
            primary_email_address_id,
            primary_phone_number_id,
          } = evt.data;

          // Find primary email
          const primaryEmail = email_addresses.find(
            (email: { id: any }) => email.id === primary_email_address_id
          );

          // Find primary phone
          const primaryPhone = phone_numbers?.find(
            (phone) => phone.id === primary_phone_number_id
          );

          if (!primaryEmail) {
            throw ApiError.badRequest("No primary email found");
          }

          const query = `
            INSERT INTO users (
              clerk_id,
              email,
              username,
              first_name,
              last_name,
              phone_number,
              country_code,
              avatar_url,
              role,
              email_verified,
              phone_verified,
              is_active,
              last_login
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
            ON CONFLICT (clerk_id) 
            DO UPDATE SET
              email = EXCLUDED.email,
              username = EXCLUDED.username,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              phone_number = EXCLUDED.phone_number,
              country_code = EXCLUDED.country_code,
              avatar_url = EXCLUDED.avatar_url,
              email_verified = EXCLUDED.email_verified,
              phone_verified = EXCLUDED.phone_verified,
              last_login = CURRENT_TIMESTAMP
            RETURNING *
          `;

          const values = [
            id,
            primaryEmail.email_address,
            username || null,
            first_name || "",
            last_name || "",
            primaryPhone?.phone_number || null,
            primaryPhone?.phone_number ? "+233" : null,
            image_url || null,
            "user",
            primaryEmail.verification.status === "verified",
            primaryPhone?.verification.status === "verified",
            true,
          ];

          const result = await pool.query(query, values);

          try {
            // Update Clerk metadata
            await clerkClient.users.updateUserMetadata(id, {
              publicMetadata: {
                role: "user",
                userId: result.rows[0].id,
              },
            });
          } catch (updateError) {
            console.error("Error updating Clerk metadata:", updateError);
            // Continue execution even if Clerk update fails
          }

          break;
        }

        case "user.updated": {
          const {
            id,
            email_addresses,
            phone_numbers,
            username,
            first_name,
            last_name,
            image_url,
            primary_email_address_id,
            primary_phone_number_id
          } = evt.data;

          const primaryEmail = email_addresses.find(
            email => email.id === primary_email_address_id
          );

          const primaryPhone = phone_numbers?.find(
            phone => phone.id === primary_phone_number_id
          );

          if (!primaryEmail) {
            throw ApiError.badRequest('No primary email found');
          }

          const query = `
            UPDATE users
            SET 
              email = $1,
              username = $2,
              first_name = $3,
              last_name = $4,
              phone_number = $5,
              country_code = $6,
              avatar_url = $7,
              email_verified = $8,
              phone_verified = $9,
              updated_at = CURRENT_TIMESTAMP
            WHERE clerk_id = $10
            RETURNING *
          `;

          const values = [
            primaryEmail.email_address,
            username || null,
            first_name || '',
            last_name || '',
            primaryPhone?.phone_number || null,
            primaryPhone?.phone_number ? '+233' : null,
            image_url || null,
            primaryEmail.verification.status === 'verified',
            primaryPhone?.verification.status === 'verified',
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
        { status: "success" },
        "Webhook processed successfully"
      );
    } catch (error) {
      console.error("Webhook processing error:", error);
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
  }
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
      "Role updated successfully"
    );
  }
);

export const listUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();

    const query = `
      SELECT 
        id,
        email,
        username,
        first_name,
        last_name,
        phone_number,
        role,
        email_verified,
        phone_verified,
        created_at,
        last_login
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return ResponseHandler.success(res, { users: result.rows });
  }
);

export const getUserStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pool = await getPool();

    const query = `
      SELECT
        COUNT(*) FILTER (WHERE is_active = true) as total_active_users,
        COUNT(*) FILTER (WHERE role = 'vendor' AND is_active = true) as total_vendors,
        COUNT(*) FILTER (WHERE email_verified = true AND is_active = true) as verified_emails,
        COUNT(*) FILTER (WHERE phone_verified = true AND is_active = true) as verified_phones,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days' AND is_active = true) as new_users_last_30_days
      FROM users
    `;

    const result = await pool.query(query);

    return ResponseHandler.success(res, { stats: result.rows[0] });
  }
);