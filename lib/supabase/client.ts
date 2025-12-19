import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Use globalThis to ensure single instance across module boundaries
const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient | undefined
}

export function createClient() {
  // Return existing global instance if available
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[v0] Supabase URL or anon key not configured")
    return null as any
  }

  // Create new instance only once
  const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Store in global to prevent duplicate instances
  if (typeof window !== "undefined") {
    globalForSupabase.supabaseClient = client
  }

  return client
}
