import { createClient } from "@supabase/supabase-js"
import { supabaseUrl, supabaseAnonKey } from "./env"
import type { Database } from "@/types/supabase"

// Create a single client instance to be reused throughout the application
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

