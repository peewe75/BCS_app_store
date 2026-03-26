import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

// POST /api/usage/increment
// Body: { app_id, action }
export async function POST(req: Request) {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: 'Configurazione server mancante.' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
    }

    const body = (await req.json()) as { app_id?: string; action?: string };
    const { app_id, action } = body;

    if (!app_id || !action) {
      return NextResponse.json({ error: 'app_id e action sono obbligatori.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Select current count
    const { data: existing } = await supabase
      .from('user_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('app_id', app_id)
      .eq('action', action)
      .eq('period', today)
      .maybeSingle();

    const newCount = ((existing?.count as number | null) ?? 0) + 1;

    const { error } = await supabase
      .from('user_usage')
      .upsert(
        { user_id: userId, app_id, action, period: today, count: newCount },
        { onConflict: 'user_id,app_id,action,period' },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: newCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
