//middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { clerkClient } from "@clerk/express";
import { getPool } from "../config/database";
import ApiError from "../utils/apiError";

// Extend the Request type to include auth property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      user?: {
        role: string;
        metadata: any;
      };
    }
  }
}

// Middleware to require authentication using Clerk
export const requireAuth = ClerkExpressRequireAuth();

// Middleware to sync user role with database
export const syncUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      return next();
    }

    const user = await clerkClient.users.getUser(req.auth.userId);
    const role = user.publicMetadata.role as string || 'user';

    const pool = await getPool();
    
    const query = `
      INSERT INTO users (clerk_id, role, is_active)
      VALUES ($1, $2, true)
      ON CONFLICT (clerk_id) 
      DO UPDATE SET role = $2
      RETURNING *
    `;

    await pool.query(query, [req.auth.userId, role]);
    
    req.user = {
      role,
      metadata: user.publicMetadata
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is admin
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const user = await clerkClient.users.getUser(req.auth.userId);
    if (user.publicMetadata.role !== "admin") {
      throw ApiError.forbidden("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is vendor
export const isVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const user = await clerkClient.users.getUser(req.auth.userId);
    const role = user.publicMetadata.role as string;

    if (role !== "vendor" && role !== "admin") {
      throw ApiError.forbidden("Vendor access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user owns the resource or is admin
export const isOwnerOrAdmin = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw ApiError.unauthorized("Authentication required");
      }

      const user = await clerkClient.users.getUser(req.auth.userId);
      
      if (user.publicMetadata.role === "admin") {
        return next();
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        throw ApiError.badRequest("Resource ID not provided");
      }

      const pool = await getPool();
      const resourceQuery = `
        SELECT user_id
        FROM ${paramName}s
        WHERE id = $1
      `;

      const resourceResult = await pool.query(resourceQuery, [resourceId]);

      if (!resourceResult.rows[0]) {
        throw ApiError.notFound("Resource not found");
      }

      if (resourceResult.rows[0].user_id !== req.auth.userId) {
        throw ApiError.forbidden("Access denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional: Middleware to attach user data to request
export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth?.userId) {
      return next();
    }

    const pool = await getPool();

    const query = `
      SELECT *
      FROM users
      WHERE clerk_id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [req.auth.userId]);

    if (result.rows[0]) {
      (req as any).user = result.rows[0];
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const rateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // limit each IP to 100 requests per windowMs
) => {
  const requests = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (requests.has(ip)) {
      const { count, resetTime } = requests.get(ip);
      
      if (now > resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
      } else if (count >= max) {
        throw ApiError.tooManyRequests('Too many requests');
      } else {
        requests.set(ip, { count: count + 1, resetTime });
      }
    } else {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
};


//Example Usage
// import express from 'express';
// import { requireAuth, isAdmin, isVendor, isOwnerOrAdmin, attachUser, rateLimit } from '../middleware/auth.middleware';

// const router = express.Router();

// // Public route
// router.get('/public', (req, res) => {
//   res.json({ message: 'Public route' });
// });

// // Protected route - requires authentication
// router.get('/protected', 
//   requireAuth,
//   (req, res) => {
//     res.json({ message: 'Protected route', userId: req.auth?.userId });
//   }
// );

// // Admin only route
// router.get('/admin', 
//   requireAuth,
//   isAdmin,
//   (req, res) => {
//     res.json({ message: 'Admin route' });
//   }
// );

// // Vendor only route
// router.get('/vendor', 
//   requireAuth,
//   isVendor,
//   (req, res) => {
//     res.json({ message: 'Vendor route' });
//   }
// );

// // Route with rate limiting
// router.get('/limited',
//   rateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
//   (req, res) => {
//     res.json({ message: 'Rate limited route' });
//   }
// );

// // Route that checks resource ownership
// router.put('/posts/:postId',
//   requireAuth,
//   isOwnerOrAdmin('post'),
//   (req, res) => {
//     res.json({ message: 'Update post' });
//   }
// );

// // Route with attached user data
// router.get('/profile',
//   requireAuth,
//   attachUser,
//   (req, res) => {
//     res.json({ user: (req as any).user });
//   }
// );

// export default router;