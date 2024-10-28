import Redis, { RedisOptions } from "ioredis";
import dotenv from "dotenv";
dotenv.config();
import logger from "./logger";

if (!process.env.REDIS_URL || !process.env.REDIS_PASSWORD) {
  throw new Error("Missing required Redis environment variables");
}

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (error) => {
  logger.error("Redis error", { error: error.message });
  console.log(error);
});

export const cache = {
  async get(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error("Cache get error", { key, error });
      return null;
    }
  },

  async set(key: string, value: any, expireSeconds?: number) {
    try {
      const serialized = JSON.stringify(value);
      if (expireSeconds) {
        await redis.setex(key, expireSeconds, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      logger.error("Cache set error", { key, error });
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error("Cache delete error", { key, error });
    }
  },
};

export default redis;

// Usage examples:

// ```typescript
// // Using direct Redis client
// import redis, { cache } from './config/redis';

// // Direct Redis operations
// await redis.set('key', 'value');
// const value = await redis.get('key');

// // Using the cache wrapper (automatically handles JSON)
// await cache.set('user:123', { name: 'John' }, 3600); // Expires in 1 hour
// const user = await cache.get('user:123');
// await cache.del('user:123');

// // Example in an API route
// app.get('/users/:id', async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Try cache first
//     const cached = await cache.get(`user:${userId}`);
//     if (cached) {
//       return res.json(cached);
//     }

//     // Your database query here
//     const user = { id: userId, name: 'John' };

//     // Save to cache
//     await cache.set(`user:${userId}`, user, 300); // 5 minutes

//     res.json(user);
//   } catch (error) {
//     logger.error('Error fetching user', { error });
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
