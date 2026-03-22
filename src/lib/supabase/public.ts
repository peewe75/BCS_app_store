import { createClient } from '@supabase/supabase-js';
import { env } from '@/src/lib/env';

const supabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const publicSupabase =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey, supabaseOptions)
    : null;

export function createClerkSupabaseBrowserClient(
  getToken: () => Promise<string | null>,
) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...supabaseOptions,
    accessToken: getToken,
  });
}
