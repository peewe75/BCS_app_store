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
  return { supabase, userId };
}

// GET /api/admin/access-codes
export async function GET(_req: NextRequest) {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ codes: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/access-codes
// Body: { code?, app_id, plan, max_uses, duration_days?, valid_until? }
export async function POST(req: NextRequest) {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase, userId } = check;

    const body = (await req.json()) as {
      code?: string;
      app_id?: string;
      plan?: string;
      max_uses?: number;
      duration_days?: number;
      valid_until?: string;
    };

    const { app_id, plan, max_uses, duration_days, valid_until } = body;
    const code = body.code?.trim().toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase();

    if (!app_id || !plan) {
      return NextResponse.json({ error: 'app_id e plan sono obbligatori.' }, { status: 400 });
    }

    const insertData: Record<string, unknown> = {
      code,
      app_id,
      plan,
      max_uses: max_uses ?? 1,
      uses_count: 0,
      created_by: userId,
      is_active: true,
    };

    if (duration_days !== undefined && duration_days !== null) {
      insertData.duration_days = duration_days;
    }
    if (valid_until) {
      insertData.valid_until = valid_until;
    }

    const { error } = await supabase.from('access_codes').insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ code });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
