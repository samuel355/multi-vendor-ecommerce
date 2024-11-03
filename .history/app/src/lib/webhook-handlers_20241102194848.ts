import { WebhookEvent } from '@clerk/nextjs/server';

export async function handleUserCreated(event: WebhookEvent) {
  if (event.type !== 'user.created') {
    throw new Error('Invalid event type');
  }

  const { id, email_addresses, first_name, last_name, image_url, primary_email_address_id } = event.data;
  
  const primaryEmail = email_addresses?.find(
    email => email.id === primary_email_address_id
  );

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'user.created',
      data: {
        id,
        email: primaryEmail?.email_address,
        first_name,
        last_name,
        image_url,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to sync user: ${response.statusText}`);
  }

  return response.json();
}

export async function handleUserUpdated(event: WebhookEvent) {
  if (event.type !== 'user.updated') {
    throw new Error('Invalid event type');
  }

  const { id, email_addresses, first_name, last_name, image_url, primary_email_address_id } = event.data;
  
  const primaryEmail = email_addresses?.find(
    email => email.id === primary_email_address_id
  );

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'user.updated',
      data: {
        id,
        email: primaryEmail?.email_address,
        first_name,
        last_name,
        image_url,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}

export async function handleUserDeleted(event: WebhookEvent) {
  if (event.type !== 'user.deleted') {
    throw new Error('Invalid event type');
  }

  const { id } = event.data;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'user.deleted',
      data: { id }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }

  return response.json();
}