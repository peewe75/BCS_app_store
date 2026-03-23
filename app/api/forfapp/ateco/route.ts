import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { activityDescription } = await req.json();

  if (!activityDescription || typeof activityDescription !== 'string') {
    return NextResponse.json({ error: 'activityDescription is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key non configurata' }, { status: 500 });
  }

  const prompt = `Sei un esperto di codici ATECO italiani. 
Analizza questa descrizione di attività: "${activityDescription}"
Restituisci i 3 codici ATECO più pertinenti in formato JSON array.
Per ogni codice indica: code (es. 62.01), description (descrizione completa), coeff (coefficiente di redditività come decimal es 0.78).
Rispondi SOLO con array JSON, nient'altro.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Errore nella chiamata Gemini' }, { status: 502 });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Risposta AI non valida' }, { status: 502 });
  }

  try {
    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'Errore nel parsing della risposta AI' }, { status: 502 });
  }
}
