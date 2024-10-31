import { Pool } from 'pg';
import { getPool } from '../config/database';
import ApiError from '../utils/apiError';
import WebSocketService from './websocket.service';
import logger from '../config/logger';
import { server } from '../app';

export class ChatService {
  private pool: Pool;
  private wsService: WebSocketService;

  constructor(wsService: WebSocketService) {
    this.initializePool();
    this.wsService = wsService;
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async createOrGetChatRoom(userId: string, vendorId: string) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if room exists
      const existingRoomQuery = `
        SELECT * FROM chat_rooms
        WHERE user_id = $1 AND vendor_id = $2
      `;
      
      const existingRoom = await client.query(existingRoomQuery, [userId, vendorId]);
      
      if (existingRoom.rows[0]) {
        await client.query('COMMIT');
        return existingRoom.rows[0];
      }

      // Create new room
      const createRoomQuery = `
        INSERT INTO chat_rooms (user_id, vendor_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const newRoom = await client.query(createRoomQuery, [userId, vendorId]);
      
      await client.query('COMMIT');
      return newRoom.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async sendMessage(
    roomId: string,
    senderType: 'user' | 'vendor',
    senderId: string,
    message: string,
    messageType: string = 'text'
  ) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify room exists and user has access
      const roomQuery = `
        SELECT * FROM chat_rooms
        WHERE id = $1 AND (
          (user_id = $2 AND $3 = 'user') OR
          (vendor_id = $2 AND $3 = 'vendor')
        )
      `;
      
      const roomResult = await client.query(roomQuery, [roomId, senderId, senderType]);
      
      if (!roomResult.rows[0]) {
        throw ApiError.forbidden('Access denied to this chat room');
      }

      // Insert message
      const messageQuery = `
        INSERT INTO chat_messages (
          room_id, sender_type, sender_id,
          message, message_type
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const messageResult = await client.query(messageQuery, [
        roomId, senderType, senderId, message, messageType
      ]);

      // Update room with last message
      const updateRoomQuery = `
        UPDATE chat_rooms
        SET 
          last_message = $1,
          last_message_time = CURRENT_TIMESTAMP,
          ${senderType === 'user' ? 'vendor_unread_count' : 'user_unread_count'} =
            ${senderType === 'user' ? 'vendor_unread_count' : 'user_unread_count'} + 1
        WHERE id = $2
        RETURNING *
      `;

      await client.query(updateRoomQuery, [message, roomId]);

      await client.query('COMMIT');

      // Emit websocket event
      this.wsService.emit('new_message', roomId, messageResult.rows[0]);

      return messageResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMessages(roomId: string, userId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        cm.*,
        CASE 
          WHEN cm.sender_type = 'user' THEN u.full_name
          ELSE v.business_name
        END as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_type = 'user' AND cm.sender_id = u.clerk_id
      LEFT JOIN vendors v ON cm.sender_type = 'vendor' AND cm.sender_id::uuid = v.id
      WHERE cm.room_id = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.pool.query(query, [roomId, limit, offset]);
    return result.rows;
  }

  async markMessagesAsRead(roomId: string, readerType: 'user' | 'vendor', readerId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify room access
      const roomQuery = `
        SELECT * FROM chat_rooms
        WHERE id = $1 AND (
          (user_id = $2 AND $3 = 'user') OR
          (vendor_id = $2 AND $3 = 'vendor')
        )
      `;
      
      const roomResult = await client.query(roomQuery, [roomId, readerId, readerType]);
      
      if (!roomResult.rows[0]) {
        throw ApiError.forbidden('Access denied to this chat room');
      }

      // Mark messages as read
      await client.query(`
        UPDATE chat_messages
        SET is_read = true
        WHERE room_id = $1
        AND sender_type != $2
        AND is_read = false
      `, [roomId, readerType]);

      // Reset unread count
      await client.query(`
        UPDATE chat_rooms
        SET ${readerType}_unread_count = 0
        WHERE id = $1
      `, [roomId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Create a single instance with WebSocketService
const wsService = new WebSocketService(server); // You'll need to pass your HTTP server instance
const chatService = new ChatService(wsService);

export default chatService;