import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

/**
 * Dashboard API routes need to read across projects. Prefer the service role key
 * server-side so Row Level Security does not return empty result sets for anon users.
 * Never expose the service role key to the browser — server-only env vars only.
 */
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';

export const supabaseServer = createClient(supabaseUrl, supabaseKey);


