"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback({
          afterSignInUrl: "/",
          afterSignUpUrl: "/"
        });
      } catch (err) {
        console.error("Error handling auth callback:", err);
        router.push("/sign-in");
      }
    }

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}