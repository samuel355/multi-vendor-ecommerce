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