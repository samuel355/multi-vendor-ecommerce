"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Icons } from "../ui/icons"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInFormValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const router = useRouter()
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignInFormValues) {
    if (!signInLoaded) return

    try {
      setIsLoading(true)

      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      if (result.status === "complete") {
        await signIn.setActive({ session: result.createdSessionId })
        router.push("/")
        toast.success("Signed in successfully!")
      } else {
        toast.error("There was a problem signing in")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!signInLoaded) return

    try {
      setIsLoading(true)
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      })
    } catch (error) {
      console.error("OAuth error:", error)
      toast.error("Error signing in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Button 
        variant="outline" 
        type="button"
        onClick={signInWithGoogle}
        disabled={isLoading}
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  )
}