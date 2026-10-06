import { createClient } from '@supabase/supabase-js';

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env`);
  return value;
}

let adminClient = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

export function supabaseForToken(token) {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}
