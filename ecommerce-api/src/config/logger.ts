import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Environment variables with defaults
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Custom format for logging
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// File transport options
const fileTransportOptions = {
  dirname: LOG_DIR,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
};

// Create logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  defaultMeta: { service: process.env.SERVICE_NAME || 'app' },
  transports: [
    // Error logs
    new DailyRotateFile({
      ...fileTransportOptions,
      filename: 'error-%DATE%.log',
      level: 'error',
    }),
    // Combined logs
    new DailyRotateFile({
      ...fileTransportOptions,
      filename: 'combined-%DATE%.log',
    }),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      ...fileTransportOptions,
      filename: 'exceptions-%DATE%.log',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      ...fileTransportOptions,
      filename: 'rejections-%DATE%.log',
    }),
  ],
  exitOnError: false,
});

// Add console transport in development environment
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create log directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Helper functions for structured logging
export const logInfo = (message: string, meta: object = {}) => {
  logger.info(message, meta);
};

export const logError = (error: Error | string, meta: object = {}) => {
  if (error instanceof Error) {
    logger.error(error.message, { ...meta, stack: error.stack });
  } else {
    logger.error(error, meta);
  }
};

export const logWarning = (message: string, meta: object = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta: object = {}) => {
  logger.debug(message, meta);
};

// Request logger middleware for Express
export const requestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    });
    next();
  };
};

// Graceful shutdown helper
export const closeLogger = async () => {
  return new Promise<void>((resolve) => {
    logger.on('finish', resolve);
    logger.end();
  });
};

export default logger;


//Usage examples:
// Basic usage
// import logger, { logInfo, logError } from './logger';

// // Simple logging
// logger.info('Application started');

// // Structured logging with metadata
// logInfo('User logged in', { userId: '123', action: 'login' });

// // Error logging
// try {
//   throw new Error('Something went wrong');
// } catch (error) {
//   logError(error, { context: 'user-service' });
// }

// // Express middleware usage
// import express from 'express';
// import { requestLogger } from './logger';

// const app = express();
// app.use(requestLogger());

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   await closeLogger();
//   process.exit(0);
// });