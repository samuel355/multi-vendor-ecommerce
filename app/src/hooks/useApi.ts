import { useState } from 'react';
import api, { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import { ApiError, ApiResponse, PaginatedResponse, Product } from '@/types/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getProfile();
      setUser(response.data.user);
      return response.data.user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || apiError.message || 'An error occurred');
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch products with proper typing
  const fetchProducts = async (params?: { 
    page?: number; 
    limit?: number; 
    category?: string 
  }): Promise<PaginatedResponse<Product>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<Product>>('/product', { params });
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || apiError.message || 'An error occurred');
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Example: Create product with proper error handling
  const createProduct = async (productData: FormData): Promise<ApiResponse<Product>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<ApiResponse<Product>>('/product', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || apiError.message || 'An error occurred');
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle errors
  const handleApiError = (err: unknown): string => {
    if (err instanceof Error) {
      const apiError = err as ApiError;
      return apiError.response?.data?.message || apiError.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
  };

  return {
    loading,
    error,
    fetchProfile,
    fetchProducts,
    createProduct,
    handleApiError,
  };
};