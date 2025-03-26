import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "./env"
import type { Database } from "@/types/supabase"

// This function should only be used in Server Components
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(
        name: string,
        value: string,
        options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean },
      ) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: { path: string; domain?: string; sameSite?: string; secure?: boolean }) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}

