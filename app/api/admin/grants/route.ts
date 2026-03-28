import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// PUT /api/admin/grants — upsert a user-app grant
export async function PUT(req: NextRequest) {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const body = (await req.json()) as {
      user_id?: string;
      app_id?: string;
      plan?: string;
      expires_at?: string | null;
    };
    const { user_id, app_id, plan, expires_at } = body;

    if (!user_id || !app_id || !plan) {
      return NextResponse.json(
        { error: 'user_id, app_id e plan sono obbligatori.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('user_apps')
      .upsert(
        { user_id, app_id, plan, expires_at: expires_at ?? null },
        { onConflict: 'user_id,app_id' },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/grants — revoke a user-app grant
export async function DELETE(req: NextRequest) {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const body = (await req.json()) as { user_id?: string; app_id?: string };
    const { user_id, app_id } = body;

    if (!user_id || !app_id) {
      return NextResponse.json(
        { error: 'user_id e app_id sono obbligatori.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('user_apps')
      .delete()
      .eq('user_id', user_id)
      .eq('app_id', app_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
