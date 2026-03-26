import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

// POST /api/redeem
// Body: { code }
export async function POST(req: Request) {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: 'Configurazione server mancante.' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
    }

    const body = (await req.json()) as { code?: string };
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Codice obbligatorio.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    // Find valid code
    const { data: codeRow } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (!codeRow) {
      return NextResponse.json({ error: 'Codice non valido o esaurito.' }, { status: 404 });
    }

    const usesCount = codeRow.uses_count as number;
    const maxUses = codeRow.max_uses as number;
    const validUntil = codeRow.valid_until as string | null;

    // Check uses count
    if (usesCount >= maxUses) {
      return NextResponse.json({ error: 'Codice non valido o esaurito.' }, { status: 404 });
    }

    // Check valid_until
    if (validUntil && new Date(validUntil) < new Date()) {
      return NextResponse.json({ error: 'Codice non valido o esaurito.' }, { status: 404 });
    }

    const durationDays = codeRow.duration_days as number | null;
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 86400000).toISOString()
      : null;

    // Upsert user_apps grant
    const { error: upsertError } = await supabase
      .from('user_apps')
      .upsert(
        {
          user_id: userId,
          app_id: codeRow.app_id as string,
          plan: codeRow.plan as string,
          expires_at: expiresAt,
        },
        { onConflict: 'user_id,app_id' },
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Increment uses_count
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({ uses_count: usesCount + 1 })
      .eq('code', code);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      app_id: codeRow.app_id,
      plan: codeRow.plan,
      expires_at: expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
