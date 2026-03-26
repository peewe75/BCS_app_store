import { NextResponse } from 'next/server';
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
  return { supabase };
}

// GET /api/admin/payments — list recent billing events from Stripe webhook log
export async function GET() {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const { data, error } = await supabase
      .from('billing_events')
      .select('id, stripe_event_id, event_type, payload, processed_at')
      .order('processed_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
