"use client"

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback()
        router.push("/")
      } catch (error) {
        console.error("Error handling callback:", error)
        router.push("/sign-in")
      }
    }

    handleCallback()
  }, [handleRedirectCallback, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}