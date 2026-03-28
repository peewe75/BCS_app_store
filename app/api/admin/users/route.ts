import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// GET /api/admin/users — list all users with their grants
export async function GET() {
  try {
    const check = await verifyAdminAccess();
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
