import { ClerkWebhookEvent } from '@/types/webhook';

export async function syncUserWithBackend(event: ClerkWebhookEvent) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    throw error;
  }
}