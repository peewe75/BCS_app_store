import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseAdminConfig } from '@/src/lib/env';

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
