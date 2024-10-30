import { Response } from "express";

export class ResponseHandler {
  //success
  static success(
    res: Response,
    message: string,
    data?: any,
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  //Error
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
  ) {
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
}


export default ResponseHandler;

// app.get('/api/health', (req: Request, res: Response) => {
//   return ResponseHandler.success(res); // Uses default message "Success" and status 200
// });

// // 6. Using with async/await
// app.get('/api/async-data', async (req: Request, res: Response) => {
//   try {
//     const data = await fetchDataFromDatabase(); // Simulated async operation
//     return ResponseHandler.success(res, data, 'Data fetched successfully');
//   } catch (error: any) {
//     return ResponseHandler.error(
//       res,
//       'Failed to fetch data',
//       500,
//       error
//     );
//   }
// });