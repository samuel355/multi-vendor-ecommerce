import axios from "axios";
import { config } from "../config";
import logger from "../config/logger";

interface PaystackTransactionInit {
  email: string;
  amount: number;
  callback_url: string;
  metadata: any;
}

export class PaystackService {
  private readonly baseUrl = config.PAYSTACK_BASE_URL;
  private readonly secretKey = config.PAYSTACK_SECRET_KEY;

  //Paystack Headers
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  //Initialize transaction
  async initializeTransaction(data: PaystackTransactionInit): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        data,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      logger.error("Paystack initialize transaction error: ", error);
      throw error;
    }
  }

  //Verify Transaction
  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      logger.error("Paystack verify transaction error:", error);
      throw error;
    }
  }

  //create subscription plan
  async createSubscription(data: {
    customer: string;
    plan: string;
    authorization: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/subscription/disable`,
        data,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      logger.error("Paystack create subscription error:", error);
      throw error;
    }
  }

  //cancel subscription
  async cancelSubscription(subscriptionCode: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/subscription/disable`,
        { code: subscriptionCode, token: subscriptionCode },
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      logger.error('Paystack cancel subscription error:', error)
      throw error;
    }
  }
}

export default new PaystackService();