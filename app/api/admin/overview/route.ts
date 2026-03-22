import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

export async function GET() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: 'Mancano CLERK_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const { userId } = await auth();
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (!userId || role !== 'admin') {
    return NextResponse.json({ error: 'Accesso admin richiesto.' }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
  }

  const [usersResult, appsResult, grantsResult, tradingCount, ravvedimentoCount, ugcCount] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('apps')
        .select('id, name, pricing_model, is_active')
        .order('sort_order', { ascending: true }),
      supabase
        .from('user_apps')
        .select('user_id, app_id, plan, granted_at')
        .order('granted_at', { ascending: false })
        .limit(50),
      supabase.from('trading_reports').select('id', { count: 'exact', head: true }),
      supabase.from('ravvedimento_calc').select('id', { count: 'exact', head: true }),
      supabase.from('ugc_videos').select('id', { count: 'exact', head: true }),
    ]);

  if (usersResult.error && usersResult.error.code === '42P01') {
    return NextResponse.json(
      { error: 'La tabella profiles non esiste ancora in Supabase. Applica la migration unificata.' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    users: usersResult.data ?? [],
    apps: appsResult.data ?? [],
    grants: grantsResult.data ?? [],
    stats: {
      users: usersResult.data?.length ?? 0,
      apps: appsResult.data?.length ?? 0,
      grants: grantsResult.data?.length ?? 0,
      tradingReports: tradingCount.count ?? 0,
      ravvedimentoCalcs: ravvedimentoCount.count ?? 0,
      ugcVideos: ugcCount.count ?? 0,
    },
  });
}
