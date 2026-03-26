import { NextRequest, NextResponse } from 'next/server';
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

// PUT /api/admin/grants — upsert a user-app grant
export async function PUT(req: NextRequest) {
  try {
    const check = await verifyAdmin();
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
    const check = await verifyAdmin();
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
