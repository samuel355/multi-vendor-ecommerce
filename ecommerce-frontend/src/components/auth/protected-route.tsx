"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "../ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVendor?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireVendor, 
  requireAdmin 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkIsVendor, checkIsAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }

    if (!isLoading && isAuthenticated) {
      if (requireVendor && !checkIsVendor()) {
        router.push('/become-vendor');
      }
      if (requireAdmin && !checkIsAdmin()) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, requireVendor, requireAdmin]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if ((requireVendor && !checkIsVendor()) || (requireAdmin && !checkIsAdmin())) {
    return null;
  }

  return <>{children}</>;
}