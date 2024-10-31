import { Pool } from "pg";
import { getPool } from "../config/database";
import { cache } from "../config/redis";
import ApiError from "../utils/apiError";
import paystackService from "./paystack.service";
import logger from "../config/logger";
import { VendorGroupItem, VendorGroup } from "../interfaces/oder.interface";
import emailService from "./email.service";

export class OrderService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async createOrder(
    userId: string,
    orderData: {
      cartId: string;
      deliveryAddress: string;
      contactPhone: string;
      notes?: string;
      callbackUrl: string;
    },
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Get cart items grouped by vendor
      const cartItemsQuery = `
        SELECT
          ci.product_id,
          ci.quantity,
          p.price,
          p.vendor_id,
          v.business_name as vendor_name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN vendors v ON p.vendor_id = v.id
        WHERE ci.cart_id = $1
      `;

      const cartItems = await client.query(cartItemsQuery, [orderData.cartId]);

      if (cartItems.rows.length === 0) {
        throw ApiError.badRequest("Cart is empty");
      }

      // Group items by vendor and calculate fees
      const vendorGroups = this.groupCartItemsByVendor(cartItems.rows);
      const { totalAmount, deliveryFee } = await this.calculateOrderTotals(
        client,
        vendorGroups,
        orderData.deliveryAddress,
      );

      // Create main order
      const orderQuery = `
        INSERT INTO orders (
          user_id, total_amount, delivery_fee,
          delivery_address, contact_phone, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const orderResult = await client.query(orderQuery, [
        userId,
        totalAmount,
        deliveryFee,
        orderData.deliveryAddress,
        orderData.contactPhone,
        orderData.notes,
      ]);

      const orderId = orderResult.rows[0].id;

      // Create order items for each vendor
      for (const vendorGroup of vendorGroups) {
        for (const item of vendorGroup.items) {
          await client.query(
            `
            INSERT INTO order_items (
              order_id, vendor_id, product_id,
              quantity, unit_price, subtotal,
              delivery_fee
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
            [
              orderId,
              vendorGroup.vendorId,
              item.product_id,
              item.quantity,
              item.price,
              item.quantity * item.price,
              vendorGroup.deliveryFee / vendorGroup.items.length, // Split delivery fee among items
            ],
          );
        }
      }

      // Clear cart
      await client.query("DELETE FROM cart_items WHERE cart_id = $1", [
        orderData.cartId,
      ]);

      // Initialize payment with Paystack
      const paymentInitiation = await paystackService.initializeTransaction({
        email: userId, // Assuming userId is email or get user's email
        amount: totalAmount + deliveryFee,
        callback_url: orderData.callbackUrl,
        metadata: {
          order_id: orderId,
        },
      });

      await client.query("COMMIT");

      // Get user details
      const userResult = await client.query(
        "SELECT * FROM users WHERE clerk_id = $1",
        [userId],
      );
      const user = userResult.rows[0];

      // Send order confirmation to user
      await emailService.sendOrderConfirmation(orderResult, user);

      // Group items by vendor and send notifications
      const vendors = this.groupItemsByVendor(cartItems.rows);
      for (const vendorId in vendors) {
        const vendorResult = await client.query(
          "SELECT * FROM vendors WHERE id = $1",
          [vendorId],
        );
        const vendor = vendorResult.rows[0];

        await emailService.sendVendorNotification(
          {
            ...orderResult,
            items: vendors[vendorId],
          },
          vendor,
        );
      }

      await client.query("COMMIT");

      return {
        orderResult,
        orderId,
        paymentUrl: paymentInitiation.data.authorization_url,
        totalAmount,
        deliveryFee,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private groupItemsByVendor(items: any[]) {
    return items.reduce((groups: any, item: any) => {
      if (!groups[item.vendor_id]) {
        groups[item.vendor_id] = [];
      }
      groups[item.vendor_id].push(item);
      return groups;
    }, {});
  }

  private groupCartItemsByVendor(cartItems: VendorGroupItem[]): VendorGroup[] {
    const groups: { [key: string]: VendorGroup } = {};

    cartItems.forEach((item) => {
      if (!groups[item.vendor_id]) {
        groups[item.vendor_id] = {
          vendorId: item.vendor_id,
          vendorName: item.vendor_name,
          items: [],
          deliveryFee: 0,
        };
      }
      groups[item.vendor_id].items.push(item);
    });

    return Object.values(groups);
  }

  private async calculateOrderTotals(
    client: any,
    vendorGroups: VendorGroup[],
    deliveryAddress: string,
  ): Promise<{ totalAmount: number; deliveryFee: number }> {
    let totalAmount = 0;
    let totalDeliveryFee = 0;

    for (const group of vendorGroups) {
      // Calculate items total
      const groupTotal = group.items.reduce(
        (sum: number, item: VendorGroupItem) =>
          sum + item.price * item.quantity,
        0,
      );
      totalAmount += groupTotal;

      // Get vendor's delivery fee for the zone
      const deliveryFeeQuery = `
        SELECT
          dz.base_fee,
          vds.additional_fee
        FROM delivery_zones dz
        JOIN vendor_delivery_settings vds ON dz.id = vds.zone_id
        WHERE vds.vendor_id = $1
        AND dz.is_active = true
        AND vds.is_active = true
      `;

      const deliveryFeeResult = await client.query(deliveryFeeQuery, [
        group.vendorId,
      ]);

      if (deliveryFeeResult.rows[0]) {
        const { base_fee, additional_fee } = deliveryFeeResult.rows[0];
        group.deliveryFee = base_fee + additional_fee;
        totalDeliveryFee += group.deliveryFee;
      }
    }

    // Apply delivery fee optimization
    if (vendorGroups.length > 1) {
      totalDeliveryFee = this.optimizeDeliveryFee(
        totalDeliveryFee,
        vendorGroups.length,
      );
    }

    return { totalAmount, deliveryFee: totalDeliveryFee };
  }

  private optimizeDeliveryFee(totalFee: number, vendorCount: number): number {
    // Apply discount for multiple vendors
    const discount = Math.min(0.3, (vendorCount - 1) * 0.1); // Max 30% discount
    return totalFee * (1 - discount);
  }

  //Track Orders
  async trackOrder(orderId: string, userId: string) {
    const query = `
      SELECT
        oi.id as order_item_id,
        oi.status,
        oi.tracking_number,
        oi.estimated_delivery_date,
        oi.actual_delivery_date,
        v.business_name as vendor_name,
        p.name as product_name,
        dt.status as tracking_status,
        dt.location,
        dt.notes,
        dt.created_at as tracking_update_time
      FROM order_items oi
      JOIN vendors v ON oi.vendor_id = v.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN delivery_tracking dt ON oi.id = dt.order_item_id
      WHERE oi.order_id = $1
      ORDER BY dt.created_at DESC
    `;

    const result = await this.pool.query(query, [orderId]);
    return this.formatTrackingResults(result.rows);
  }

  private formatTrackingResults(trackingData: any[]) {
    // Group tracking updates by order item
    const groupedTracking = trackingData.reduce((groups: any, item) => {
      if (!groups[item.order_item_id]) {
        groups[item.order_item_id] = {
          orderItemId: item.order_item_id,
          productName: item.product_name,
          vendorName: item.vendor_name,
          status: item.status,
          trackingNumber: item.tracking_number,
          estimatedDelivery: item.estimated_delivery_date,
          actualDelivery: item.actual_delivery_date,
          updates: [],
        };
      }

      if (item.tracking_status) {
        groups[item.order_item_id].updates.push({
          status: item.tracking_status,
          location: item.location,
          notes: item.notes,
          timestamp: item.tracking_update_time,
        });
      }

      return groups;
    }, {});

    return Object.values(groupedTracking);
  }

  async updateOrderStatus(
    orderItemId: string,
    vendorId: string,
    updateData: {
      status: string;
      location?: string;
      notes?: string;
    },
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Verify vendor owns the order item
      const verifyQuery = `
        SELECT id FROM order_items
        WHERE id = $1 AND vendor_id = $2
      `;

      const verifyResult = await client.query(verifyQuery, [
        orderItemId,
        vendorId,
      ]);
      if (!verifyResult.rows[0]) {
        throw ApiError.forbidden("Not authorized to update this order");
      }

      // Update order item status
      await client.query(
        `
        UPDATE order_items
        SET status = $1,
        ${updateData.status === "delivered" ? "actual_delivery_date = CURRENT_TIMESTAMP," : ""}
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
        [updateData.status, orderItemId],
      );

      // Add tracking update
      await client.query(
        `
        INSERT INTO delivery_tracking (
          order_item_id, status, location, notes
        ) VALUES ($1, $2, $3, $4)
      `,
        [orderItemId, updateData.status, updateData.location, updateData.notes],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new OrderService();
