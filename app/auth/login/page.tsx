import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth/auth-form"

export default async function LoginPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.auth.getSession()

  // If user is already logged in, redirect to account page
  if (data.session) {
    redirect("/account")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In or Sign Up</h1>
        <AuthForm />
      </div>
    </div>
  )
}

