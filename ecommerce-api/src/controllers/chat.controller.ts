import { Request, Response } from 'express';
import chatService from '../services/chat.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class ChatController {
  createRoom = catchAsync(async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { vendorId } = req.body;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const room = await chatService.createOrGetChatRoom(userId, vendorId);
    ResponseHandler.success(res, 'Chat room created successfully', room);
  });

  sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { roomId, message, messageType } = req.body;
    const userId = req.auth?.userId;
    const senderType = req.path.includes('/vendor/') ? 'vendor' : 'user';
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newMessage = await chatService.sendMessage(
      roomId,
      senderType,
      userId,
      message,
      messageType
    );
    
    ResponseHandler.success(res, 'Message sent successfully', newMessage);
  });

  getMessages = catchAsync(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const userId = req.auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const messages = await chatService.getMessages(roomId, userId, page);
    ResponseHandler.success(res,  messages, 'Messages retrieved successfully');
  });

  markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const userId = req.auth?.userId;
    const readerType = req.path.includes('/vendor/') ? 'vendor' : 'user';
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    await chatService.markMessagesAsRead(roomId, readerType, userId);
    ResponseHandler.success(res, 'Messages marked as read');
  });
}

export default new ChatController();