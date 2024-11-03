import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return new NextResponse('Webhook secret not provided', { status: 500 });
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error verifying webhook', { status: 400 });
    }

    // Forward the webhook to your backend API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.API_WEBHOOK_SECRET || '', // Add this to secure webhook endpoint
        },
        body: JSON.stringify({
          type: evt.type,
          data: evt.data,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      return NextResponse.json(
        { message: 'Webhook processed', data },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error forwarding webhook:', error);
      return new NextResponse(
        'Error processing webhook',
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      'Internal Server Error',
      { status: 500 }
    );
  }
}

// Add webhook types
type EventType = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended';

interface WebhookPayload {
  type: EventType;
  data: {
    id: string;
    email_addresses?: Array<{
      id: string;
      email_address: string;
    }>;
    first_name?: string;
    last_name?: string;
    phone_numbers?: Array<{
      id: string;
      phone_number: string;
    }>;
    image_url?: string;
    primary_email_address_id?: string;
  };
}