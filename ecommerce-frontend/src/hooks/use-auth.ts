import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    logout,
  };
}