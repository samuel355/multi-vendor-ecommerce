import dotenv from 'dotenv';
dotenv.config();

interface Config {
  PAYSTACK_SECRET_KEY: string;
}

export const config: Config = {
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  // Add other environment variables
};