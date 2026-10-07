import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// PUT /api/admin/credits
// Body: { user_id, app_id, delta }
export async function PUT(req: Request) {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const body = (await req.json()) as { user_id?: string; app_id?: string; delta?: number };
    const { user_id, app_id, delta } = body;

    if (!user_id || !app_id || !Number.isSafeInteger(delta) || Math.abs(delta!) > 2147483647) {
      return NextResponse.json({ error: 'user_id, app_id e delta sono obbligatori.' }, { status: 400 });
    }

    const { data: newCredits, error } = await supabase.rpc('adjust_app_credits', {
      p_user_id: user_id, p_app_id: app_id, p_delta: delta,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credits: newCredits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
