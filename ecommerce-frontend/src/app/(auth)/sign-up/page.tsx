import { SignUpForm } from "@/components/auth/sign-up-form"
import { Shell } from "@/components/shells/shell"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <Shell className="max-w-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sign up method
        </p>
      </div>
      <SignUpForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="hover:text-brand underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </Shell>
  )
}