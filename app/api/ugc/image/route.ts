import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasSupabaseAdminConfig } from '@/src/lib/env';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';

export const maxDuration = 60;

const IMAGE_COST = 25;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  // Credit check (skip for admin)
  if (hasSupabaseAdminConfig()) {
    const clerkUser = await currentUser();
    const isAdmin = (clerkUser?.publicMetadata?.role as string | undefined) === 'admin';

    if (!isAdmin) {
      const supabase = createSupabaseAdminClient();
      if (supabase) {
        const { data: creditRow } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .eq('app_id', 'ugc')
          .maybeSingle();

        const currentCredits = (creditRow?.credits as number | null) ?? 0;

        if (currentCredits < IMAGE_COST) {
          return NextResponse.json(
            { error: `Crediti insufficienti. L'immagine richiede ${IMAGE_COST} crediti (hai ${currentCredits}).` },
            { status: 402 },
          );
        }

        await supabase
          .from('user_credits')
          .update({ credits: currentCredits - IMAGE_COST })
          .eq('user_id', userId)
          .eq('app_id', 'ugc');
      }
    }
  }

  try {
    const body = (await req.json()) as {
      prompt: string;
      referenceImageBase64: string | null;
      mode: 'quality' | 'speed';
      aspectRatio: string;
    };

    const ai = new GoogleGenAI({ apiKey });

    const modelName = 'gemini-2.5-flash-image';

    const parts: { inlineData?: { mimeType: string; data: string }; text?: string }[] = [];

    if (body.referenceImageBase64) {
      const { mimeType, data } = extractSupportedImageBase64(body.referenceImageBase64);
      parts.push({ inlineData: { mimeType, data } });
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
        return NextResponse.json({
          image: `data:${part.inlineData.mimeType ?? 'image/png'};base64,${part.inlineData.data}`,
        });
      }
    }

    return NextResponse.json({ error: 'Nessuna immagine generata dal modello' }, { status: 500 });
  } catch (err) {
    if (err instanceof InvalidUgcImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[ugc/image]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
