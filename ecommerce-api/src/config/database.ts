//config/database.ts
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
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize pool
const initializePool = (): Pool => {
  validateConfig();
  
  const newPool = new Pool(createPoolConfig());
  
  // Error handling
  newPool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  return newPool;
};

// Get pool instance
export const getPool = async (): Promise<Pool> => {
  if (!pool) {
    pool = initializePool();
  }
  
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Database connected successfully')
    client.release();
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

// Close pool
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};


//Usage example:

// // In your application code
// import { query, closePool } from './database';

// async function example() {
//   try {
//     // Execute a query
//     const result = await query('SELECT * FROM users WHERE id = $1', [1]);
//     console.log(result.rows);
    
//     // When shutting down
//     await closePool();
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   await closePool();
//   process.exit(0);
// });
