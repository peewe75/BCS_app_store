import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasSupabaseAdminConfig } from '@/src/lib/env';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Supabase non configurato' }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase non disponibile' }, { status: 503 });

  // Controlla se l'utente ha già mai avuto una riga user_credits per UGC
  const { data: existing } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .eq('app_id', 'ugc')
    .maybeSingle();

  if (existing !== null) {
    return NextResponse.json(
      { error: 'Generazione gratuita già riscattata.' },
      { status: 409 },
    );
  }

  // Inserisce 1 credito gratuito
  const { error: insertError } = await supabase
    .from('user_credits')
    .insert({ user_id: userId, app_id: 'ugc', credits: 1 });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Generazione gratuita già riscattata.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Dà anche il grant user_apps (piano 'free') per sbloccare l'accesso all'app
  await supabase.from('user_apps').upsert(
    { user_id: userId, app_id: 'ugc', plan: 'free' },
    { onConflict: 'user_id,app_id' },
  );

  return NextResponse.json({ credits: 1, message: 'Credito gratuito attivato!' });
}
