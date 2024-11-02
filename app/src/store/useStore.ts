import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);