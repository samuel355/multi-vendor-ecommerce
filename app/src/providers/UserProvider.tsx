'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

interface UserContextType {
  dbUser: any | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  dbUser: null,
  loading: true,
  refetch: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {getToken} = useAuth()

  const fetchUser = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ dbUser, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useDbUser = () => useContext(UserContext);