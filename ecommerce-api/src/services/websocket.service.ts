import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '@clerk/clerk-sdk-node';
import logger from '../config/logger';

export class WebSocketService {
  private io: Server;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    this.initialize();
  }

  private initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication error');
        }

        const session = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY
        });
        
        socket.data.userId = session.sub;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join personal room
      socket.join(socket.data.userId);

      // Handle joining chat rooms
      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        logger.info(`Client ${socket.id} joined room ${roomId}`);
      });

      // Handle leaving chat rooms
      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        logger.info(`Client ${socket.id} left room ${roomId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public emit(event: string, room: string, data: any) {
    this.io.to(room).emit(event, data);
  }
}

export default WebSocketService;