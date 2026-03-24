import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  try {
    const body = (await req.json()) as {
      prompt: string;
      referenceImageBase64: string | null;
      mode: 'quality' | 'speed';
      aspectRatio: string;
    };

    const ai = new GoogleGenAI({ apiKey });

    // Google image generation currently uses Gemini 2.5 Flash Image.
    const modelName = body.mode === 'quality'
      ? 'gemini-2.5-flash-image'
      : 'gemini-2.5-flash-image';

    const parts: { inlineData?: { mimeType: 'image/png'; data: string }; text?: string }[] = [];

    if (body.referenceImageBase64) {
      const cleanData = body.referenceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      parts.push({ inlineData: { mimeType: 'image/png', data: cleanData } });
    }
    parts.push({ text: body.prompt });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: { aspectRatio: body.aspectRatio },
      } as Record<string, unknown>,
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return NextResponse.json({ image: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    return NextResponse.json({ error: 'Nessuna immagine generata dal modello' }, { status: 500 });
  } catch (err) {
    console.error('[ugc/image]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
