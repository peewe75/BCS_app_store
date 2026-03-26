import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

// GET /api/user/credits?app_id=ugc
export async function GET(req: NextRequest) {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: 'Configurazione server mancante.' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
    }

    const appId = req.nextUrl.searchParams.get('app_id');
    if (!appId) {
      return NextResponse.json({ error: 'app_id è obbligatorio.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    const { data } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .maybeSingle();

    return NextResponse.json({ credits: (data?.credits as number | null) ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
