import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isServerUserAdmin } from '@/src/lib/auth/admin-server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { CreditError, reserveCredits, refundCredits } from '@/src/lib/credits';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';

export const maxDuration = 60;

const IMAGE_COST = 25;

export async function POST(req: Request) {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Servizi della generazione non configurati.' }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Servizio crediti non disponibile.' }, { status: 503 });
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

    const modelName = 'gemini-2.5-flash-image';

    const parts: { inlineData?: { mimeType: string; data: string }; text?: string }[] = [];

    if (body.referenceImageBase64) {
      const { mimeType, data } = extractSupportedImageBase64(body.referenceImageBase64);
      parts.push({ inlineData: { mimeType, data } });
    }
    parts.push({ text: body.prompt });

    const clerkUser = await currentUser();
    const isAdmin = await isServerUserAdmin(userId, clerkUser?.publicMetadata?.role, supabase);
    if (!isAdmin) reservationId = (await reserveCredits(supabase, userId, 'ugc', IMAGE_COST)).id;

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
      try { await refundCredits(supabase, reservationId); }
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
