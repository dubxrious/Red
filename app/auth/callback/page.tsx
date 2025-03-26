"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleAuthCallback() {
      const code = searchParams.get("code")

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code)
          router.push("/account")
        } catch (err) {
          console.error("Error exchanging code for session:", err)
          setError("Authentication failed. Please try again.")
        }
      } else {
        router.push("/auth/login")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2">{error}</p>
          <button className="mt-4 rounded bg-primary px-4 py-2 text-white" onClick={() => router.push("/auth/login")}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Completing authentication...</h1>
        <p className="mt-2">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

