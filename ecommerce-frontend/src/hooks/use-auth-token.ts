"use client";

import { useAuth } from '@clerk/nextjs';

export function useAuthToken() {
  const { getToken } = useAuth();

  const getAuthToken = async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  return { getAuthToken };
}