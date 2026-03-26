import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get('timeframe');

  let query = supabaseAdmin
    .from('softi_ai_reports')
    .select('id, timeframe, markdown_content, source_metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (timeframe) query = query.eq('timeframe', timeframe);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reports: data });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  const body = (await req.json()) as { timeframe?: string; symbols?: string[] };
  const timeframe = body.timeframe ?? 'daily';
  const symbols = body.symbols ?? [];

  // Recupera segnali recenti in base al timeframe
  const daysBack = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30;
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

  let signalQuery = supabaseAdmin
    .from('softi_mt5_signals')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200);

  if (symbols.length > 0) signalQuery = signalQuery.in('symbol', symbols);

  const { data: signals } = await signalQuery;

  const signalsSummary = signals && signals.length > 0
    ? JSON.stringify(signals.slice(0, 50), null, 2)
    : 'Nessun segnale disponibile nel periodo selezionato.';

  const systemPrompt = `Sei un analista quantitativo AI. Genera un report di mercato ${timeframe} professionale in formato Markdown.
Struttura: ## Sommario Esecutivo | ## Analisi per Simbolo | ## Regime di Mercato | ## Conclusioni Operative
Segnali disponibili: ${signalsSummary}`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Genera report ${timeframe}` }] }],
      config: { systemInstruction: systemPrompt },
    });

    const markdownContent = result.text ?? '';

    const { data: inserted, error } = await supabaseAdmin
      .from('softi_ai_reports')
      .insert({
        user_id: userId,
        timeframe,
        markdown_content: markdownContent,
        source_metadata: { signals_count: signals?.length ?? 0, symbols, since },
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ report: inserted });
  } catch (err) {
    console.error('[softi/reports] Gemini error:', err);
    return NextResponse.json({ error: 'Errore generazione report' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id mancante' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('softi_ai_reports')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
