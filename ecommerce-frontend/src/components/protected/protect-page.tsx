"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';

export function ProtectedComponent() {
  const { isAuthenticated, getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          try {
            const response = await apiClient.get('/protected-route');
            console.log(response)
          } catch (error) {
            // Handle error
            console.log(error)
          }
        }
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return <div>Protected Content</div>;
}