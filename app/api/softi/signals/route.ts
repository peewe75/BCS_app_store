import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);

  let query = supabaseAdmin
    .from('softi_mt5_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (symbol) query = query.eq('symbol', symbol);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ signals: data });
}
