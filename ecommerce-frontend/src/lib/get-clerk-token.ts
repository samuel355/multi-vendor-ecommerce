import {useAuth } from '@clerk/nextjs';

export async function getClerkToken() {
  if (typeof window !== 'undefined') {
    return await window.Clerk?.session?.getToken();
  }
  const { getToken } = useAuth();
  return await getToken();
}