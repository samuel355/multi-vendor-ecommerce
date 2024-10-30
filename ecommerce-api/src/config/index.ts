import dotenv from 'dotenv';
dotenv.config();

interface Config {
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_BASE_URL: string;
}

export const config: Config = {
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_BASE_URL:process.env.PAYSTACK_BASE_URL || '',
  // Add other environment variables
};