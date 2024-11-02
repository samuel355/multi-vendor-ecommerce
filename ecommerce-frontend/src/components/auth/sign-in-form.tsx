"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const signInWithGoogle = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Error signing in with Google");
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        toast.success("Signed in successfully!");
        router.push("/");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error?.errors?.[0]?.message || "Error signing in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={signInWithGoogle}
        className="flex items-center gap-2"
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/sign-up"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}