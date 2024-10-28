import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getPool } from "./config/database";
import redis from "./config/redis";
import logger, { requestLogger } from "./config/logger";
import authRouter from "./routes/auth.route";

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


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//database connection
getPool();
// Check Redis connection on startup
const checkRedisConnection = async () => {
  try {
    await redis.ping();
    logger.info('✅ Redis connected successfully');
    console.log('Redis connected successfully')
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/v1/auth', authRouter);

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the multi-vendor E-commerce API" });
});

export default app;
