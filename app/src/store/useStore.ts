import { ProductProps } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface CartItem extends ProductProps {
  quantity: number;
}

interface FavoriteItem extends ProductProps {
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  favorites: FavoriteItem[];
  discount: number; // Percentage discount, e.g., 10 for 10%
  addItem: (item: ProductProps, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearFavorites: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  addToFavorites: (item: ProductProps) => void;
  removeFromFavorites: (id: string) => void;
  moveToCart: (id: string, quantity?: number) => void;
  isInCart: (id: string) => boolean;
  isInFavorites: (id: string) => boolean;
  getCartItemCount: () => number;
  getFavoritesCount: () => number;
  setDiscount: (percentage: number) => void;
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
      name: "auth-storage",
    },
  ),
);

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],
      discount: 0, // Initialize discount at 0%

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              ...state,
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            ...state,
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),

      clearCart: () => set((state) => ({ ...state, items: [] })),
      clearFavorites: () => set((state) => ({ ...state, favorites: [] })),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (subtotal, item) => subtotal + item.price * item.quantity,
          0,
        );
      },

      getTotal: () => {
        const { getSubtotal, discount } = get();
        const subtotal = getSubtotal();
        return subtotal - subtotal * (discount / 100);
      },

      setDiscount: (percentage) => set({ discount: percentage }),

      addToFavorites: (item) =>
        set((state) => {
          if (!state.favorites.some((f) => f.id === item.id)) {
            return {
              ...state,
              favorites: [...state.favorites, { ...item, addedAt: new Date() }],
            };
          }
          return state;
        }),

      removeFromFavorites: (id) =>
        set((state) => ({
          ...state,
          favorites: state.favorites.filter((item) => item.id !== id),
        })),

      moveToCart: (id, quantity = 1) => {
        const { favorites } = get();
        const item = favorites.find((f) => f.id === id);
        if (item) {
          get().addItem(item, quantity);
          get().removeFromFavorites(id);
        }
      },

      isInCart: (id) => {
        const { items } = get();
        return items.some((item) => item.id === id);
      },

      isInFavorites: (id) => {
        const { favorites } = get();
        return favorites.some((item) => item.id === id);
      },

      getCartItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getFavoritesCount: () => {
        const { favorites } = get();
        return favorites.length;
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
