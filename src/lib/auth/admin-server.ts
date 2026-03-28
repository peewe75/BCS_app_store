import { auth, currentUser } from '@clerk/nextjs/server';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { isAdminRole } from '@/src/lib/auth/roles';

type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function getProfileRole(supabase: SupabaseAdminClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role;
}

export async function isServerUserAdmin(
  userId: string,
  role?: unknown,
  supabase?: SupabaseAdminClient | null,
) {
  if (isAdminRole(role)) {
    return true;
  }

  const client = supabase ?? createSupabaseAdminClient();
  if (!client) {
    return false;
  }

  return isAdminRole(await getProfileRole(client, userId));
}

export async function verifyAdminAccess() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return { error: 'Configurazione server mancante.', status: 503 as const };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: 'Accesso admin richiesto.', status: 403 as const };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: 'Supabase admin non disponibile.', status: 503 as const };
  }

  const user = await currentUser();
  const isAdmin = await isServerUserAdmin(userId, user?.publicMetadata?.role, supabase);

  if (!isAdmin) {
    return { error: 'Accesso admin richiesto.', status: 403 as const };
  }

  return { supabase, userId };
}
