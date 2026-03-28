import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

export async function GET() {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

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

    return NextResponse.json(
      {
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
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore inatteso nella console admin.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
