import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "./env"
import type { Database } from "@/types/supabase"

// This function should only be used in Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}

