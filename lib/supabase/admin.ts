import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Use globalThis to ensure single instance of admin client
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdminClient: SupabaseClient | undefined
}

export function getAdminClient() {
  // Return existing global instance if available
  if (globalForSupabaseAdmin.supabaseAdminClient) {
    return globalForSupabaseAdmin.supabaseAdminClient
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[v0] Supabase URL or service role key not configured")
    return null as any
  }

  // Create new instance only once
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  // Store in global to prevent duplicate instances
  globalForSupabaseAdmin.supabaseAdminClient = client

  return client
}
