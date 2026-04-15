import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim() || 'https://placeholder.supabase.co';

/**
 * Server-only Supabase client for API routes and server components.
 * MUST use the service role key so RLS does not hide rows on dashboard reads.
 *
 * Vercel: set `SUPABASE_SERVICE_ROLE_KEY` (exact name) for Production + Preview.
 */
function getServerSupabaseKey(): string {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service) return service;

  if (process.env.VERCEL === '1') {
    console.error(
      '[supabase-server] SUPABASE_SERVICE_ROLE_KEY is missing. Dashboard APIs may return empty data due to RLS. Add it in Vercel → Settings → Environment Variables and redeploy.'
    );
  }

  return (
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    'placeholder-key'
  );
}

const supabaseKey = getServerSupabaseKey();

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
