import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

export function useVendor() {
  const { user } = useAuth();

  const becomeVendor = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/vendor', data);
      return response.data;
    },
  });

  const vendorProfile = useQuery({
    queryKey: ['vendorProfile', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/vendor/profile');
      return response.data;
    },
    enabled: !!user,
  });

  return {
    becomeVendor,
    vendorProfile,
  };
}