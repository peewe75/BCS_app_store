import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  const body = (await req.json()) as {
    symbols?: string[];
    prompt?: string;
    mode?: 'analysis' | 'chat';
  };

  const symbols = body.symbols ?? [];
  const userPrompt = body.prompt ?? '';
  const mode = body.mode ?? 'analysis';

  // Recupera ultimi segnali per i simboli richiesti
  let signalsContext = '';
  if (symbols.length > 0) {
    const { data: signals } = await supabaseAdmin
      .from('softi_mt5_signals')
      .select('symbol, action, confidence_score, market_regime, wyckoff_phase, created_at')
      .in('symbol', symbols)
      .order('created_at', { ascending: false })
      .limit(50);

    if (signals && signals.length > 0) {
      signalsContext = `\n\nUltimi segnali MT5:\n${JSON.stringify(signals, null, 2)}`;
    }
  }

  const systemPrompt = mode === 'analysis'
    ? `Sei un analista finanziario AI specializzato in trading algoritmico.
Analizza i segnali MT5 forniti e produci un'analisi professionale in italiano.
Includi: bias di mercato, fase Wyckoff, regime di mercato, e raccomandazioni operative.${signalsContext}`
    : `Sei un assistente AI per trader professionisti.
Rispondi in italiano in modo preciso e professionale.${signalsContext}`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt || `Analizza i simboli: ${symbols.join(', ')}` }] },
      ],
      config: { systemInstruction: systemPrompt },
    });

    const responseText = result.text ?? '';

    // Salva in storico
    await supabaseAdmin.from('softi_analysis_history').insert({
      user_id: userId,
      asset_symbols: symbols,
      prompt: userPrompt,
      response: responseText,
    });

    return NextResponse.json({ analysis: responseText, symbols });
  } catch (err) {
    console.error('[softi/analyze] Gemini error:', err);
    return NextResponse.json({ error: 'Errore generazione analisi' }, { status: 500 });
  }
}
