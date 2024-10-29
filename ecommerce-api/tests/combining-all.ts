I have these: 1. class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message: string) {
    return new ApiError(401, message);
  }

  static forbidden(message: string) {
    return new ApiError(403, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static internal(message: string) {
    return new ApiError(500, message);
  }
  
  static tooManyRequests(message: string){
    return new ApiError(403, message)
  }
}

export default ApiError;



2. import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;

3. import { Response } from "express";

export class ResponseHandler {
  //success
  static success(
    res: Response,
    data: any = null,
    message: string = "Success",
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  //Error
  static error(
    res: Response,
    message: string = "Error Occured",
    statusCode: number = 500,
    error: any = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}


export default ResponseHandler;

4. import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";

export const validateRequest = (type: any, skipMissingProperties = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToClass(type, req.body);
    const errors = await validate(dtoObj, { skipMissingProperties });

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      next(
        ApiError.badRequest(
          `Validation failed: ${JSON.stringify(validationErrors)}`,
        ),
      );
      return;
    }

    req.body = dtoObj;
    next();
  };
};

export default validateRequest;



5. import express, { Application, Request, Response, NextFunction } from "express";
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

// Routes
app.use('/api/v1/auth', authRouter);

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the multi-vendor E-commerce API" });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
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



How can i used especially from 1 to 4

I'll show you how to use these utilities (ApiError, catchAsync, ResponseHandler, and validateRequest) in a practical example. Let's create a simple user authentication controller:

```typescript
// userAuth.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// userAuth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import ApiError from '../utils/apiError';
import ResponseHandler from '../utils/responseHandler';

export class AuthController {
  // Register user
  register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw ApiError.badRequest('User already exists with this email');
    }

    // Create new user
    const user = await UserService.create({ name, email, password });

    // Return success response
    return ResponseHandler.success(
      res,
      { user },
      'User registered successfully',
      201
    );
  });

  // Login user
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserService.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    return ResponseHandler.success(
      res,
      { user, token },
      'Login successful'
    );
  });

  // Get user profile
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id; // Assuming you have authentication middleware

    const user = await UserService.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return ResponseHandler.success(
      res,
      { user },
      'Profile retrieved successfully'
    );
  });
}

// auth.route.ts
import express from 'express';
import { AuthController } from '../controllers/userAuth.controller';
import { validateRequest } from '../utils/validateRequest';
import { RegisterUserDto } from '../dtos/userAuth.dto';

const router = express.Router();
const authController = new AuthController();

router.post(
  '/register',
  validateRequest(RegisterUserDto), // Validate request body
  authController.register
);

router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

export default router;

// error.middleware.ts (Global error handler)
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import ResponseHandler from '../utils/responseHandler';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return ResponseHandler.error(
      res,
      err.message,
      err.statusCode,
      err
    );
  }

  // For unhandled errors
  return ResponseHandler.error(
    res,
    'Internal server error',
    500,
    err
  );
};
```

Here's how each utility is being used:

1. **ApiError**:
   - Used to throw specific HTTP errors with status codes
   - Example: `throw ApiError.badRequest('User already exists')`

2. **catchAsync**:
   - Wraps async controller methods to handle promise rejections
   - Eliminates need for try-catch blocks in controllers
   - Example: `register = catchAsync(async (req, res) => { ... })`

3. **ResponseHandler**:
   - Standardizes API responses
   - Used for both success and error responses
   - Example: `ResponseHandler.success(res, data, message, statusCode)`

4. **validateRequest**:
   - Validates incoming request body against DTO schemas
   - Used as middleware in routes
   - Example: `validateRequest(RegisterUserDto)`

To implement this in your application:

1. Add the error handler middleware to your app.ts:

```typescript
// app.ts
import { errorHandler } from './middleware/error.middleware';

// ... other middleware and routes ...

// Add error handler last
app.use(errorHandler);
```

2. Use the routes in your app:

```typescript
// app.ts
import authRouter from './routes/auth.route';

app.use('/api/auth', authRouter);
```

This setup provides:
- Request validation using DTOs
- Standardized error handling
- Consistent API responses
- Clean controller code without try-catch blocks
- Type safety with TypeScript

The error handling flow:
1. Validation errors are caught by validateRequest middleware
2. Controller errors are caught by catchAsync
3. All errors are processed by the global error handler
4. Responses are standardized using ResponseHandler

This architecture makes it easy to:
- Add new endpoints
- Handle errors consistently
- Validate requests
- Maintain clean and organized code
