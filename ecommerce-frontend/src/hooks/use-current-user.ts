import apiClient from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!isSignedIn) return null;
      const response = await apiClient.get("/users/me");
      return response.data;
    },
    enabled: isLoaded && isSignedIn,
  });

  return {
    user,
    isLoading: !isLoaded || isLoading,
    isAuthenticated: isSignedIn && !!user,
    clerkUser
  };
}