//ecommerce-api/src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getPool } from "./config/database";
import redis from "./config/redis";
import logger, { requestLogger } from "./config/logger";
import authRouter from "./routes/auth.route";
import 'reflect-metadata';
import { errorHandler } from "./middleware/error.middleware";
import ApiError from "./utils/apiError";
import vendorRouter from "./routes/vendor.route";
import productRouter from "./routes/product.route";
import subscriptionRouter from "./routes/subscription.route";

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger());
app.use(errorHandler);

// Always last middleware
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/', vendorRouter)
app.use('/api/v1/', productRouter)
app.use('/api/v1/', subscriptionRouter) 

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the multi-vendor E-commerce API" });
});

// 404 Handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Database connection
getPool();

// Check Redis connection
const checkRedisConnection = async () => {
  try {
    await redis.ping();
    logger.info('✅ Redis connected successfully');
    console.log('Redis connected successfully');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
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
    logger.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize the application
initializeApp();

export default app;