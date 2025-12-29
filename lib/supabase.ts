import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use new publishable key (sb_publishable_*) or legacy anon key
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables")
}

// Client for client-side usage (if needed)
// Uses publishable key - safe for browser use with RLS enabled
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Server-side client (uses secret key for admin operations)
// Use new secret key (sb_secret_*) or legacy service_role key
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Create a Supabase client for server-side operations
// Uses service role key for admin access (bypasses RLS)
// This function is kept for backward compatibility
export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
