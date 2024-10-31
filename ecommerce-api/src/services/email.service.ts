import nodemailer, { Transporter } from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import * as path from 'path';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import Queue from 'bull';
import logger from '../config/logger';
import { cache } from '../config/redis';
import { getPool } from '../config/database';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: any;
  attachments?: any[];
}

export class EmailService {
  private transporter: Transporter;
  private sesClient: SESClient;
  private emailQueue: Queue.Queue;
  private readonly templatesDir: string;

  constructor() {
    this.initialize();
    this.templatesDir = path.join(__dirname, '../templates/emails');
    this.emailQueue = new Queue('email-queue', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    });

    this.processQueue();
  }

  private async initialize() {
    if (process.env.NODE_ENV === 'production') {
      // Use AWS SES in production
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      });
    } else {
      // Use SMTP in development
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  private async processQueue() {
    this.emailQueue.process(async (job) => {
      try {
        await this.sendEmail(job.data);
        // Log success
        await this.logEmailStatus(job.data.to, 'success');
      } catch (error) {
        // Log failure
        await this.logEmailStatus(job.data.to, 'failed', error);
        throw error;
      }
    });

    this.emailQueue.on('failed', (job, error) => {
      logger.error('Email job failed:', { jobId: job.id, error });
    });
  }

  private async logEmailStatus(recipient: string | string[], status: string, error?: any) {
    try {
      const pool = await getPool();
      await pool.query(
        `INSERT INTO email_logs (recipient, status, error)
         VALUES ($1, $2, $3)`,
        [Array.isArray(recipient) ? recipient.join(', ') : recipient, status, error?.message]
      );
    } catch (logError) {
      logger.error('Error logging email status:', logError);
    }
  }

  private async compileTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const cacheKey = `email-template:${templateName}`;

    try {
      // Try to get compiled template from cache
      let template = await cache.get(cacheKey);

      if (!template) {
        // If not in cache, read and compile template
        const source = await fs.promises.readFile(templatePath, 'utf8');
        template = Handlebars.compile(source);
        // Cache the compiled template
        await cache.set(cacheKey, template.toString(), 3600);
      } else {
        // Convert cached string back to function
        template = new Function('return ' + template)();
      }

      return template(context);
    } catch (error) {
      logger.error('Template compilation error:', error);
      throw error;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const html = await this.compileTemplate(options.template, options.context);
    const text = htmlToText(html);

    if (process.env.NODE_ENV === 'production') {
      // Send using AWS SES
      const command = new SendEmailCommand({
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to]
        },
        Message: {
          Body: {
            Html: { Data: html },
            Text: { Data: text }
          },
          Subject: { Data: options.subject }
        },
        Source: process.env.EMAIL_FROM
      });

      await this.sesClient.send(command);
    } else {
      // Send using SMTP
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html,
        text,
        attachments: options.attachments
      });
    }
  }

  async queueEmail(options: EmailOptions): Promise<void> {
    await this.emailQueue.add(options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }

  // Helper methods for common email types
  async sendWelcomeEmail(user: any): Promise<void> {
    await this.queueEmail({
      to: user.email,
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      context: {
        name: user.full_name,
        siteName: process.env.SITE_NAME,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${user.verification_token}`
      }
    });
  }

  async sendOrderConfirmation(order: any, user: any): Promise<void> {
    await this.queueEmail({
      to: user.email,
      subject: `Order Confirmation #${order.id}`,
      template: 'order-confirmation',
      context: {
        name: user.full_name,
        orderNumber: order.id,
        items: order.items,
        total: order.total_amount
      }
    });
  }

  async sendVendorNotification(order: any, vendor: any): Promise<void> {
    await this.queueEmail({
      to: vendor.contact_email,
      subject: 'New Order Received',
      template: 'vendor-notification',
      context: {
        vendorName: vendor.business_name,
        items: order.items.filter((item: any) => item.vendor_id === vendor.id)
      }
    });
  }

  async sendSubscriptionConfirmation(subscription: any, vendor: any): Promise<void> {
    await this.queueEmail({
      to: vendor.contact_email,
      subject: 'Subscription Confirmation',
      template: 'subscription-confirmation',
      context: {
        vendorName: vendor.business_name,
        planName: subscription.plan_name,
        startDate: new Date(subscription.start_date).toLocaleDateString(),
        endDate: new Date(subscription.end_date).toLocaleDateString(),
        amount: subscription.amount
      }
    });
  }
}

export default new EmailService();