import { Pool } from 'pg';
import { getPool } from '../config/database';
import { WebSocketService } from './websocket.service';
import { server } from '../app';

export class NotificationService {
  private pool: Pool;
  private wsService: WebSocketService;

  constructor(wsService: WebSocketService) {
    this.initializePool();
    this.wsService = wsService;
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    const query = `
      INSERT INTO notifications (
        user_id, type, title, 
        message, metadata
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      data.userId,
      data.type,
      data.title,
      data.message,
      data.metadata
    ]);

    // Send real-time notification
    this.wsService.emit('notification', data.userId, result.rows[0]);

    return result.rows[0];
  }

  async markAsRead(notificationId: string, userId: string) {
    const query = `
      UPDATE notifications
      SET read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [notificationId, userId]);
    return result.rows[0];
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
}

const wsService = new WebSocketService(server);
export default new NotificationService(wsService);