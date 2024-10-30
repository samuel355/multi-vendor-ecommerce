import { Pool } from "pg";
import { getPool } from "../config/database";
import { BillingCycle, CreateSubscriptionDTO } from "../dtos/subscription.dto";
import ApiError from "../utils/apiError";
import paystackService from "./paystack.service";

export class SubscriptionService {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  //Initiate subscription
  async initiateSubscription(vendorId: string, data: CreateSubscriptionDTO) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      //get vendor details
      const vendorResult = await client.query(
        "SELECT * FROM vendors WHERE id=$1",
        [vendorId],
      );
      const vendor = vendorResult.rows[0];

      //get plan details
      const planResult = await client.query(
        "SELECT * FROM subscription_plans WHERE id = $ 1",
        [data.planId],
      );
      const plan = planResult.rows[0];

      if (!plan) {
        throw ApiError.notFound("Subscription plan not found");
      }

      //Calculate amount based on billing cycle
      const amount =
        data.billingCycle === BillingCycle.MONTHLY
          ? plan.price_montly
          : plan.price_yearly;

      const paystackResponse = await paystackService.initializeTransaction({
        email: vendor.contact_email,
        amount: amount * 100,
        callback_url:
          data.callbackUrl ||
          `${process.env.APP_URL}/api/v1/subscriptions/verify`,
        metadata: {
          vendor_id: vendorId,
          plan_id: data.planId,
          billing_cycle: data.billingCycle,
        },
      });

      await client.query("COMMIT");
      return paystackResponse;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //Verify Subscription Payment and save record
  async verifySubscription(reference: string) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const verification = await paystackService.verifyTransaction(reference);

      if (verification.data.status !== "success") {
        throw ApiError.badRequest("Paystack verification failed");
      }

      const { vendor_id, plan_id, billing_cycle } = verification.data.metadata;

      //Calculate subscription period
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (billing_cycle === BillingCycle.MONTHLY) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription record
      const subscriptionQuery = `
        INSERT INTO vendor_subscriptions (
          vendor_id, plan_id, status, billing_cycle,
          start_date, end_date, last_payment_date,
          next_payment_date, paystack_subscription_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const subscriptionResult = await client.query(subscriptionQuery, [
        vendor_id,
        plan_id,
        "active",
        billing_cycle,
        startDate,
        endDate,
        startDate,
        endDate,
        verification.data.authorization.authorization_code,
      ]);
      
      // Record transaction
      const transactionQuery = `
        INSERT INTO subscription_transactions (
          vendor_subscription_id, vendor_id, amount,
          currency, paystack_reference, status,
          payment_method, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      await client.query(transactionQuery, [
        subscriptionResult.rows[0].id,
        vendor_id,
        verification.data.amount / 100,
        'NGN',
        reference,
        'success',
        verification.data.channel,
        verification.data
      ]);

      await client.query('COMMIT');
      return subscriptionResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error
    }finally{
      client.release()
    }
  }
  
  //Admin get all subscriptions
  async getAllSubscriptions(page: number = 1, limit: number = 20){
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT vs.*, v.business_name, sp.name as plan_name
      FROM vendor_subscriptions vs
      JOIN vendors v ON vs.vendor_id = v.id
      JOIN subscription_plans sp ON vs.plan_id = sp.id
      ORDER BY vs.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM vendor_subscriptions
    `;
    
    const [subscriptions, count] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery)
    ]);
    
    return {
      subscriptions: subscriptions.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };
  }
}
