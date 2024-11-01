import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'vendor' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) => 
        set({ user, isAuthenticated: !!user }),
      setToken: (token) => 
        set({ token }),
      logout: () => 
        set({ user: null, isAuthenticated: false, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);