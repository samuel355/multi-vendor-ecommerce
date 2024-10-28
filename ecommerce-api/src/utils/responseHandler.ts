import { Response } from "express";

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