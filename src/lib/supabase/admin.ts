import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  // This client bypasses RLS. Never expose this to the browser.
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
