"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignInButtonCustom() {
  return (
    <SignInButton mode="modal">
      <Button variant="ghost">Sign In</Button>
    </SignInButton>
  );
}

export function SignUpButtonCustom() {
  return (
    <SignUpButton mode="modal">
      <Button>Get Started</Button>
    </SignUpButton>
  );
}