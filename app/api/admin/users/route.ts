import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

async function verifyAdmin() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return { error: 'Configurazione server mancante.', status: 503 as const };
  }
  const { userId } = await auth();
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (!userId || role !== 'admin') {
    return { error: 'Accesso admin richiesto.', status: 403 as const };
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: 'Supabase admin non disponibile.', status: 503 as const };
  }
  return { supabase };
}

// GET /api/admin/users — list all users with their grants
export async function GET() {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const [profilesResult, grantsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('user_apps')
        .select('user_id, app_id, plan, expires_at'),
    ]);

    if (profilesResult.error) {
      return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
    }

    const grants = grantsResult.data ?? [];
    const users = (profilesResult.data ?? []).map((profile) => ({
      ...profile,
      grants: grants.filter((g) => g.user_id === profile.id),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
