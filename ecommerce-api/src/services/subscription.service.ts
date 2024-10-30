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
  
  
}
