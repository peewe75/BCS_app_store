import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// GET /api/admin/payments — list recent billing events from Stripe webhook log
export async function GET() {
  try {
    const check = await verifyAdminAccess();
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
