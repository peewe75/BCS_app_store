import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

async function verifyAdmin() {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return { error: 'Configurazione server mancante.', status: 503 };
    }
    const { userId } = await auth();
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;
    if (!userId || role !== 'admin') {
      return { error: 'Accesso admin richiesto.', status: 403 };
    }
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return { error: 'Supabase admin non disponibile.', status: 503 };
    }
    return { supabase };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore inatteso nella verifica admin.';
    return { error: message, status: 500 };
  }
}

// PUT /api/admin/apps/[id] — update app
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await verifyAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;
  const body = await req.json();

  // Don't allow changing the primary key
  delete body.id;

  const { data, error } = await check.supabase
    .from('apps')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'App non trovata.' }, { status: 404 });
  }

  return NextResponse.json({ app: data });
}

// DELETE /api/admin/apps/[id] — delete app
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await verifyAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const { error } = await check.supabase
    .from('apps')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
