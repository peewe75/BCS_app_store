import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

// POST /api/usage/spend-credit
// Body: { app_id }
export async function POST(req: Request) {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: 'Configurazione server mancante.' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
    }

    const body = (await req.json()) as { app_id?: string };
    const { app_id } = body;

    if (!app_id) {
      return NextResponse.json({ error: 'app_id è obbligatorio.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    // Get current credits
    const { data: creditRow } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .eq('app_id', app_id)
      .maybeSingle();

    const currentCredits = (creditRow?.credits as number | null) ?? 0;

    if (currentCredits < 1) {
      return NextResponse.json({ error: 'Crediti esauriti.' }, { status: 402 });
    }

    const newCredits = currentCredits - 1;

    const { error } = await supabase
      .from('user_credits')
      .update({ credits: newCredits })
      .eq('user_id', userId)
      .eq('app_id', app_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credits: newCredits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
