// config/database.ts
import { Pool, PoolConfig } from "pg";

// Single pool instance
let pool: Pool | null = null;

// Validate required environment variables
const validateConfig = () => {
  const required = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Create pool configuration
const createPoolConfig = (): PoolConfig => ({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Limit connections to prevent overload
  idleTimeoutMillis: 60000, // Keep idle connections for 1 minute
  connectionTimeoutMillis: 5000, // 5-second connection attempt timeout
});

// Retry logic for database connection initialization
const initializePoolWithRetry = async (retries = 5): Promise<Pool> => {
  validateConfig();

  for (let i = 0; i < retries; i++) {
    try {
      const newPool = new Pool(createPoolConfig());

      // Error handling for unexpected errors on idle clients
      newPool.on("error", (err) => {
        console.error("Unexpected error on idle client:", err);
      });

      // Test the connection
      const client = await newPool.connect();
      console.log("Database connected successfully");
      client.release();
      return newPool;

    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      
      // If last retry, throw error
      if (i === retries - 1) {
        throw new Error("Failed to connect to database after multiple attempts");
      }
      
      // Exponential backoff before retrying
      await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }

  throw new Error("Database initialization failed");
};

// Get pool instance, ensuring only one is created
export const getPool = async (): Promise<Pool> => {
  if (!pool) {
    pool = await initializePoolWithRetry();
  }
  return pool;
};

// Close pool when shutting down
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log("Database pool closed");
    pool = null;
  }
};
