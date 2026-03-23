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

// GET /api/admin/apps — full app list
export async function GET() {
  const check = await verifyAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { data, error } = await check.supabase
    .from('apps')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ apps: data });
}

// POST /api/admin/apps — create new app
export async function POST(req: NextRequest) {
  const check = await verifyAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json();
  const { id, name, ...rest } = body;

  if (!id || !name) {
    return NextResponse.json({ error: 'id e name sono obbligatori.' }, { status: 400 });
  }

  const { data, error } = await check.supabase
    .from('apps')
    .insert({ id, name, ...rest })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ app: data }, { status: 201 });
}
