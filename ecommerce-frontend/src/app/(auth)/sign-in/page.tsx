import { SignInForm } from "@/components/auth/sign-in-form"
import { Shell } from "@/components/shells/shell"
import Link from "next/link"

export default function SignInPage() {
  return (
    <Shell className="max-w-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sign in method
        </p>
      </div>
      <SignInForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/sign-up"
          className="hover:text-brand underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </Shell>
  )
}