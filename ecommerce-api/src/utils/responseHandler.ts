import { Response } from 'express';

class ResponseHandler {
  static success(res: Response, data: any = null, message: string = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data
    });
  }

  static created(res: Response, data: any = null, message: string = 'Created successfully') {
    return res.status(201).json({
      status: 'success',
      message,
      data
    });
  }

  static error(res: Response, message: string, statusCode: number = 500) {
    return res.status(statusCode).json({
      status: 'error',
      message
    });
  }
}

export default ResponseHandler;