import { AxiosError } from 'axios';

// Define the structure of your API error response
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Custom type for API errors
export type ApiError = AxiosError<ApiErrorResponse>;

// Other types...
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: "user" | "vendor" | "admin";
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  vendorId: string;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}
