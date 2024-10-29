import { validate } from "class-validator";
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


// 1. First, create a DTO (Data Transfer Object) class with validation decorators:

// ```typescript
// // dto/user.dto.ts
// import { IsString, IsEmail, MinLength } from 'class-validator';

// export class CreateUserDto {
//   @IsString()
//   name: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   @MinLength(6)
//   password: string;
// }
// ```

// 2. Use the middleware in your routes:

// ```typescript
// // routes/user.routes.ts
// import express from 'express';
// import validateRequest from '../middleware/validateRequest';
// import { CreateUserDto } from '../dto/user.dto';

// const router = express.Router();

// router.post(
//   '/users',
//   validateRequest(CreateUserDto), // Add the middleware here
//   async (req, res) => {
//     // Your route handler logic
//     // req.body will be an instance of CreateUserDto
//     const user = req.body;
//     // Process the validated data
//     res.status(201).json(user);
//   }
// );
// ```

// 3. Complete example with error handling:

// ```typescript
// // app.ts
// import express from 'express';
// import { validateRequest } from './middleware/validateRequest';
// import { CreateUserDto } from './dto/user.dto';

// const app = express();
// app.use(express.json());

// // Error handling middleware
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   if (err instanceof ApiError) {
//     res.status(err.code).json({
//       message: err.message
//     });
//     return;
//   }
//   res.status(500).json({
//     message: 'Internal Server Error'
//   });
// });

// // Route with validation
// app.post('/users', validateRequest(CreateUserDto), async (req, res) => {
//   try {
//     const user = req.body;
//     // Process the validated data
//     res.status(201).json(user);
//   } catch (error) {
//     next(error);
//   }
// });
