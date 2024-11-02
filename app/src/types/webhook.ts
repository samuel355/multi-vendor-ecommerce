export interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses?: Array<{
      id: string;
      email_address: string;
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    primary_email_address_id?: string;
  };
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UserWebhookData {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export interface UserWebhookPayload {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: UserWebhookData;
}