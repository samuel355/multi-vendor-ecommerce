Here's an example of how to use it in a controller:

```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import { catchAsync } from '../utils/catchAsync';
import ResponseHandler from '../utils/responseHandler';

export class AuthController {
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Please provide email and password');
    }

    // Your login logic here
    const user = await UserService.findByEmail(email);
    
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    ResponseHandler.success(res, { user }, 'Login successful');
  });
}

// Example of authentication middleware
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get token
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Please log in to get access');
  }

  try {
    // 2) Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 3) Check if user still exists
    // const user = await User.findById(decoded.id);
    
    // 4) Check if user changed password after token was issued
    // if (user.changedPasswordAfter(decoded.iat)) {
    //   throw ApiError.unauthorized('User recently changed password! Please log in again.');
    // }

    // Grant access to protected route
    // req.user = user;
    next();
  } catch (error) {
    throw ApiError.unauthorized('Invalid token');
  }
});

// Rate limiting middleware example
export const rateLimit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const requestCount = await redis.incr(`rateLimit:${ip}`);
  
  if (requestCount === 1) {
    await redis.expire(`rateLimit:${ip}`, 60); // 60 seconds window
  }
  
  if (requestCount > 100) { // 100 requests per minute
    throw ApiError.tooManyRequests('Too many requests from this IP');
  }
  
  next();
});
```

And in your routes:

```typescript
// src/routes/auth.route.ts
import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect, rateLimit } from '../middleware/auth.middleware';
import { validateRequest } from '../utils/validateRequest';
import { LoginDto } from '../dtos/auth.dto';

const router = express.Router();
const authController = new AuthController();

router.post(
  '/login',
  rateLimit,
  validateRequest(LoginDto),
  authController.login
);

router.get(
  '/profile',
  protect,
  authController.getProfile
);

export default router;
```

And for your DTOs:

```typescript
// src/dtos/auth.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}