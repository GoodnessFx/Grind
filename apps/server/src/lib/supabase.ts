import { createClient } from '@supabase/supabase-js';

// DB connection is read from env only — never hardcode keys here.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — used only by the hidden admin system when a service role key
// is configured (enables auth admin lookups + bypasses RLS for admin tables).
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export const hasServiceRole = () => supabaseAdmin !== null;

