import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// We only want to throw an error at runtime if these are missing.
// During build time (e.g. Next.js static analysis), we'll allow it to be initialized with empty strings
// to prevent the build from crashing, though actual calls will fail later.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

