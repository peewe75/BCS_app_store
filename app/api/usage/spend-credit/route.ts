import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { CreditError, reserveCredits } from '@/src/lib/credits';

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

    const reservation = await reserveCredits(supabase, userId, app_id, 1);
    return NextResponse.json({ credits: reservation.credits });
  } catch (error) {
    if (error instanceof CreditError) return NextResponse.json({ error: error.message }, { status: error.status });
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
