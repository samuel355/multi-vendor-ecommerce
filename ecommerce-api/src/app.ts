//ecommerce-api/src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getPool } from "./config/database";
import redis from "./config/redis";
import logger, { requestLogger } from "./config/logger";
import "reflect-metadata";
import { errorHandler } from "./middleware/error.middleware";
import ApiError from "./utils/apiError";
import vendorRouter from "./routes/vendor.route";
import productRouter from "./routes/product.route";
import subscriptionRouter from "./routes/subscription.route";
import orderRouter from "./routes/order.route";
import adminRouter from "./routes/admin.route";
import testRouter from "./routes/test.route";
import gpsRouter from "./routes/gpgps.route";
import authRouter from "./routes/auth.route";
import mapRouter from "./routes/map.route";
import chatRouter from "./routes/chat.route";

import { createServer } from 'http';
import WebSocketService from './services/websocket.service';
import reviewRouter from "./routes/reviewRoute";
import wishlistRouter from "./routes/wishlist.route";

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
export const server = createServer(app);

// Initialize WebSocket service
new WebSocketService(server);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger());
app.use(errorHandler);

//Base Route
app.get("/api/v1/", (req: Request, res: Response) => {
  res.json({
    message:
      "You probably shouldn't be here but Welcome to the multi-vendor E-commerce API",
  });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vendor", vendorRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/test", testRouter);
app.use("/api/v1/gpgps", gpsRouter);
app.use("/api/v1/map", mapRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/wishlist", wishlistRouter);

// 404 Handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// app.use(
//   (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
//     errorHandler(err, req, res, next);
//   }
// );

// // Global Error Handler
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   logger.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// Database connection
getPool();

// Check Redis connection
const checkRedisConnection = async () => {
  try {
    await redis.ping();
    logger.info("✅ Redis connected successfully");
    console.log("Redis connected successfully");
  } catch (error) {
    logger.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
};

// Initialize connections
const initializeApp = async () => {
  try {
    await checkRedisConnection();

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to initialize app:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Initialize the application
initializeApp();

export default app;
