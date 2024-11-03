import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { handleUserCreated, handleUserUpdated, handleUserDeleted } from '@/lib/webhook-handlers';

export async function POST(req: Request) {
  try {

      // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)


    
    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error verifying webhook', { 
        status: 400 
      });
    }

    // Handle different webhook events
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event);
        break;
      case 'user.updated':
        await handleUserUpdated(event);
        break;
      case 'user.deleted':
        await handleUserDeleted(event);
        break;
      default:
        return new Response(`Webhook type ${event.type} not handled`, {
          status: 400
        });
    }

    return new Response('Webhook processed successfully', { 
      status: 200 
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      return new Response(`Webhook error: ${error.message}`, { 
        status: 400 
      });
    }
    return new Response('Internal Server Error', { 
      status: 500 
    });
  }
}