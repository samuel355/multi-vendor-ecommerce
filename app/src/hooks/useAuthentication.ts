import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthentication() {
  const { isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const initializeUser = async () => {
      try {
        if (userId && user) {
          // Check if user exists in your database
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${await getToken()}`,
            },
          });

          if (!response.ok) {
            // If user doesn't exist in your database, redirect to onboarding
            router.push('/onboarding');
            return;
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, [isLoaded, userId, user, router]);

  return {
    isLoaded,
    isInitialized,
    user,
    userId,
  };
}