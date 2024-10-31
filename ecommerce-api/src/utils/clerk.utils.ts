import { clerkClient } from "@clerk/express";
import { getPool } from "../config/database";

export async function setUserRole(userId: string, role: 'user' | 'vendor' | 'admin') {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role }
    });
    
    // Sync with database
    const pool = await getPool();
    await pool.query(
      'UPDATE users SET role = $1 WHERE clerk_id = $2',
      [role, userId]
    );

    return user;
  } catch (error) {
    throw error;
  }
}