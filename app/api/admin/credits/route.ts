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

    if (!user_id || !app_id || typeof delta !== 'number') {
      return NextResponse.json({ error: 'user_id, app_id e delta sono obbligatori.' }, { status: 400 });
    }

    // Get current credits
    const { data: existing } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user_id)
      .eq('app_id', app_id)
      .maybeSingle();

    const currentCredits = (existing?.credits as number | null) ?? 0;
    const newCredits = Math.max(0, currentCredits + delta);

    const { error } = await supabase
      .from('user_credits')
      .upsert(
        { user_id, app_id, credits: newCredits },
        { onConflict: 'user_id,app_id' },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credits: newCredits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
