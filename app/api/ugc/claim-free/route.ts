import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

export async function POST() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Servizi della prova non configurati.' }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase non disponibile' }, { status: 503 });
  const { data, error } = await supabase.rpc('claim_ugc_trial', { p_user_id: userId });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Prova gratuita già riscattata o crediti già attivi.' }, { status: 409 });
    console.error('[ugc/trial]', error);
    return NextResponse.json({ error: 'Attivazione prova non riuscita.' }, { status: 503 });
  }
  return NextResponse.json({ credits: data, message: 'Prova attivata: 100 crediti per un’immagine e un video.' });
}
