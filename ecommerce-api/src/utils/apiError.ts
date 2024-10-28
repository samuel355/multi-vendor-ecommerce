class ApiError extends Error {
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


// // Example 2: Authentication middleware
// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization;
  
//   if (!token) {
//     throw ApiError.unauthorized('No token provided');
//   }
  
//   try {
//     // Verify token logic here
//     next();
//   } catch (error) {
//     throw ApiError.unauthorized('Invalid token');
//   }
// };

// // Example 3: Rate limiting
// const rateLimitMiddleware = (req, res, next) => {
//   if (tooManyRequests) {
//     throw ApiError.tooManyRequests('Rate limit exceeded. Please try again later');
//   }
//   next();
// };