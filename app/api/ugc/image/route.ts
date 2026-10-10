import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isServerUserAdmin } from '@/src/lib/auth/admin-server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasSupabaseAdminConfig } from '@/src/lib/env';
import { CreditError, reserveCredits, refundCredits } from '@/src/lib/credits';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';
import { getRequestUser, requestGeminiKey } from '@/src/lib/auth/request-user';

export const maxDuration = 60;

const IMAGE_COST = 25;

export async function POST(req: Request) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const personalApiKey = req.headers.get('x-ugc-gemini-key')?.trim() || '';
  const apiKey = requestGeminiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'Inserisci la tua API key Gemini prima di generare.' }, { status: 400 });

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : null;
  if (!personalApiKey && !supabase) return NextResponse.json({ error: 'Servizio crediti non disponibile.' }, { status: 503 });
  let reservationId: string | undefined;

  try {
    const body = (await req.json()) as {
      prompt: string;
      referenceImageBase64: string | null;
      mode: 'quality' | 'speed';
      aspectRatio: string;
    };
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || typeof body.aspectRatio !== 'string') {
      return NextResponse.json({ error: 'Prompt e proporzioni sono obbligatori.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const modelName = env.ugcImageModel;

    const parts: { inlineData?: { mimeType: string; data: string }; text?: string }[] = [];

    if (body.referenceImageBase64) {
      const { mimeType, data } = extractSupportedImageBase64(body.referenceImageBase64);
      parts.push({ inlineData: { mimeType, data } });
    }
    parts.push({ text: body.prompt });

    const isAdmin = user.role === 'admin' || user.role === 'super_admin'
      || (!personalApiKey && supabase ? await isServerUserAdmin(user.userId, user.role, supabase) : false);
    if (!personalApiKey && !isAdmin && supabase) reservationId = (await reserveCredits(supabase, user.userId, 'ugc', IMAGE_COST)).id;

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
        return NextResponse.json({
          image: `data:${part.inlineData.mimeType ?? 'image/png'};base64,${part.inlineData.data}`,
        });
      }
    }

    throw new Error('Nessuna immagine generata dal modello');
  } catch (err) {
    if (reservationId) {
      try { if (supabase) await refundCredits(supabase, reservationId); }
      catch (refundError) {
        return NextResponse.json({ error: (refundError as Error).message, reference: reservationId }, { status: 503 });
      }
    }
    if (err instanceof CreditError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
    if (err instanceof InvalidUgcImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[ugc/image]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
