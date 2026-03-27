import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasSupabaseAdminConfig } from '@/src/lib/env';

// Veo generation can take 60-90s — requires Vercel Pro for maxDuration > 60
export const maxDuration = 300;

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
        // Check credits
        const { data: creditRow } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .eq('app_id', 'ugc')
          .maybeSingle();

        const currentCredits = (creditRow?.credits as number | null) ?? 0;

        const VIDEO_COST = 75;
        if (currentCredits < VIDEO_COST) {
          return NextResponse.json(
            { error: `Crediti insufficienti. Il video richiede ${VIDEO_COST} crediti (hai ${currentCredits}).` },
            { status: 402 },
          );
        }

        // Decrement credits
        await supabase
          .from('user_credits')
          .update({ credits: currentCredits - VIDEO_COST })
          .eq('user_id', userId)
          .eq('app_id', 'ugc');
      }
    }
  }

  try {
    const body = (await req.json()) as { imageBase64: string; prompt: string };

    const ai = new GoogleGenAI({ apiKey });
    const data = body.imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: body.prompt,
      image: { imageBytes: data, mimeType: 'image/png' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' },
    });

    const MAX_ATTEMPTS = 40;
    let attempts = 0;

    while (!operation.done) {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        return NextResponse.json({ error: 'Timeout generazione video. Il server sta impiegando troppo tempo.' }, { status: 504 });
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });

      if (operation.error) {
        return NextResponse.json({ error: `Veo API Error: ${operation.error.message ?? 'Unknown error'}` }, { status: 500 });
      }
    }

    if (operation.error) {
      return NextResponse.json({ error: `Veo API Error: ${operation.error.message}` }, { status: 500 });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return NextResponse.json({ error: 'Video generato ma nessun URI restituito. Possibile filtro di sicurezza.' }, { status: 500 });
    }

    // Download video and return as base64 so the client can create a blob URL
    const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
    if (!videoResponse.ok) {
      return NextResponse.json({ error: `Errore download video: ${videoResponse.status}` }, { status: 500 });
    }

    const buffer = await videoResponse.arrayBuffer();
    const videoBase64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({ videoBase64 });
  } catch (err) {
    console.error('[ugc/video]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
