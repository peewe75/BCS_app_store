import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Autenticazione webhook tramite secret condiviso con l'EA MT5
  const secret = req.headers.get('x-webhook-secret');
  if (process.env.SOFTI_WEBHOOK_SECRET && secret !== process.env.SOFTI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  const { error } = await supabaseAdmin.from('softi_mt5_signals').insert({
    symbol: String(payload.symbol ?? ''),
    action: payload.action ? String(payload.action) : null,
    confidence_score: payload.confidence_score != null ? Number(payload.confidence_score) : null,
    base_confidence: payload.base_confidence != null ? Number(payload.base_confidence) : null,
    market_regime: payload.market_regime ? String(payload.market_regime) : null,
    wyckoff_phase: payload.wyckoff_phase ? String(payload.wyckoff_phase) : null,
    raw_payload: payload,
  });

  if (error) {
    console.error('[softi/mt5/webhook] DB error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
