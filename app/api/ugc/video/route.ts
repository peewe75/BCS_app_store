import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isServerUserAdmin } from '@/src/lib/auth/admin-server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasGeminiApiKey, hasSupabaseAdminConfig } from '@/src/lib/env';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';
import { getGeminiServerClient } from '@/src/lib/google-genai';

export const maxDuration = 300;

const VIDEO_COST = 75;
const MAX_ATTEMPTS = 40;
const POLL_DELAY_MS = 5000;
const VEO_AUDIO_MODEL_DEFAULT = 'veo-3.1-generate-preview';
const VEO_REQUIRED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg']);

async function downloadGeneratedVideoBase64(
  ai: NonNullable<ReturnType<typeof getGeminiServerClient>>,
  generatedVideo: { mimeType?: string; videoBytes?: string },
) {
  if (generatedVideo.videoBytes) {
    return {
      mimeType: generatedVideo.mimeType ?? 'video/mp4',
      videoBase64: generatedVideo.videoBytes,
    };
  }

  const tempPath = join(tmpdir(), `ugc-veo-${crypto.randomUUID()}.mp4`);

  try {
    await ai.files.download({
      file: generatedVideo,
      downloadPath: tempPath,
    });

    const buffer = await readFile(tempPath);
    return {
      mimeType: generatedVideo.mimeType ?? 'video/mp4',
      videoBase64: buffer.toString('base64'),
    };
  } finally {
    await rm(tempPath, { force: true }).catch(() => undefined);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  if (!hasGeminiApiKey()) {
    return NextResponse.json({ error: 'GEMINI_API_KEY non configurata.' }, { status: 500 });
  }

  const ai = getGeminiServerClient();
  if (!ai) {
    return NextResponse.json({ error: 'Client Gemini non disponibile.' }, { status: 503 });
  }

  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    const clerkUser = await currentUser();
    const isAdmin = await isServerUserAdmin(userId, clerkUser?.publicMetadata?.role, supabase);

    if (!isAdmin) {
      if (supabase) {
        const { data: creditRow } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .eq('app_id', 'ugc')
          .maybeSingle();

        const currentCredits = (creditRow?.credits as number | null) ?? 0;

        if (currentCredits < VIDEO_COST) {
          return NextResponse.json(
            { error: `Crediti insufficienti. Il video richiede ${VIDEO_COST} crediti (hai ${currentCredits}).` },
            { status: 402 },
          );
        }

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
    const { mimeType, data } = extractSupportedImageBase64(body.imageBase64);

    if (!VEO_REQUIRED_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Veo 3.1 accetta solo immagini PNG o JPG come frame iniziale.' },
        { status: 400 },
      );
    }

    let operation = await ai.models.generateVideos({
      model: env.veoAudioModel || VEO_AUDIO_MODEL_DEFAULT,
      prompt: body.prompt,
      image: { imageBytes: data, mimeType },
      config: {
        numberOfVideos: 1,
        durationSeconds: 8,
        resolution: '720p',
        aspectRatio: '16:9',
      },
    });

    let attempts = 0;
    while (!operation.done) {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Timeout generazione video. Il server sta impiegando troppo tempo.' },
          { status: 504 },
        );
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
      operation = await ai.operations.getVideosOperation({ operation });

      if (operation.error) {
        return NextResponse.json(
          { error: `Veo API Error: ${operation.error.message ?? 'Unknown error'}` },
          { status: 500 },
        );
      }
    }

    if (operation.error) {
      return NextResponse.json(
        { error: `Veo API Error: ${operation.error.message ?? 'Unknown error'}` },
        { status: 500 },
      );
    }

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!generatedVideo) {
      return NextResponse.json(
        { error: 'Video generato ma nessun payload video restituito da Veo 3.1.' },
        { status: 500 },
      );
    }

    const downloadedVideo = await downloadGeneratedVideoBase64(ai, generatedVideo);
    return NextResponse.json(downloadedVideo);
  } catch (err) {
    if (err instanceof InvalidUgcImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error('[ugc/video]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno' },
      { status: 500 },
    );
  }
}
