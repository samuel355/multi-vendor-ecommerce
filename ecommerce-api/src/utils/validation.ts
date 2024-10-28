import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request, Response, NextFunction } from 'express';
import ApiError from './apiError';

export const validateRequest = (type: any, skipMissingProperties = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObj = plainToClass(type, req.body);
        const errors = await validate(dtoObj, { skipMissingProperties });
        
        if (errors.length > 0) {
            const validationErrors = errors.map((error) => ({
                property: error.property,
                constraints: error.constraints
            }));
            
            next(ApiError.badRequest(`Validation failed: ${JSON.stringify(validationErrors)}`));
            return;
        }
        
        req.body = dtoObj;
        next();
    };
};

export default validateRequest;