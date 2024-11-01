'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

interface User {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Update AuthContextType to include getToken
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  checkIsVendor: () => boolean;
  checkIsAdmin: () => boolean;
  getToken: () => Promise<string | null>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { getToken: clerkGetToken } = useClerkAuth();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = async () => {
    try {
      return await clerkGetToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (clerkUser) {
        try {
          const token = await getToken();
          if (token) {
            const response = await apiClient.get('/auth/profile');
            const userData = response.data.data.user;
            setUser(userData);
            setRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    };

    if (clerkLoaded) {
      fetchUserProfile();
    }
  }, [clerkUser, clerkLoaded]);

  const signOut = async () => {
    try {
      await clerkSignOut();
      setUser(null);
      setRole(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkIsVendor = () => role === 'vendor' || role === 'admin';
  const checkIsAdmin = () => role === 'admin';

  const value = {
    user,
    isLoading: isLoading || !clerkLoaded,
    isAuthenticated: !!user,
    role,
    signOut,
    checkIsVendor,
    checkIsAdmin,
    getToken, // Add this line
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};