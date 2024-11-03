import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateRole: async (data: { userId: string; role: string }) => {
    const response = await api.put('/auth/role', data);
    return response.data;
  },
  listUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export default api;