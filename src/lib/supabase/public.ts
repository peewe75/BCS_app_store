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

type ClerkGetToken = () => Promise<string | null>;

export function createClerkSupabaseBrowserClient(
  getToken: ClerkGetToken,
) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...supabaseOptions,
    // With the native Clerk integration enabled, Supabase accepts the default Clerk session token.
    accessToken: async () => getToken(),
  });
}
