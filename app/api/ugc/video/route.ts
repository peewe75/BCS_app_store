import { NextResponse } from 'next/server';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isServerUserAdmin } from '@/src/lib/auth/admin-server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasSupabaseAdminConfig } from '@/src/lib/env';
import { CreditError, reserveCredits, refundCredits } from '@/src/lib/credits';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';
import { getGeminiServerClient } from '@/src/lib/google-genai';
import { GoogleGenAI } from '@google/genai';
import { getRequestUser, requestGeminiKey } from '@/src/lib/auth/request-user';

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
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const personalApiKey = req.headers.get('x-ugc-gemini-key')?.trim() || '';
  const apiKey = requestGeminiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'Inserisci la tua API key Gemini prima di generare.' }, { status: 400 });
  const ai = personalApiKey ? new GoogleGenAI({ apiKey }) : getGeminiServerClient();
  if (!ai) {
    return NextResponse.json({ error: 'Client Gemini non disponibile.' }, { status: 503 });
  }

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : null;
  if (!personalApiKey && !supabase) return NextResponse.json({ error: 'Servizio crediti non disponibile.' }, { status: 503 });
  let reservationId: string | undefined;

  try {
    const body = (await req.json()) as { imageBase64: string; prompt: string };
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || typeof body.imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Immagine e prompt sono obbligatori.' }, { status: 400 });
    }
    const { mimeType, data } = extractSupportedImageBase64(body.imageBase64);

    if (!VEO_REQUIRED_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Veo 3.1 accetta solo immagini PNG o JPG come frame iniziale.' },
        { status: 400 },
      );
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin'
      || (!personalApiKey && supabase ? await isServerUserAdmin(user.userId, user.role, supabase) : false);
    if (!personalApiKey && !isAdmin && supabase) reservationId = (await reserveCredits(supabase, user.userId, 'ugc', VIDEO_COST)).id;

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
        throw new CreditError('Timeout generazione video. Il server sta impiegando troppo tempo.', 504);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
      operation = await ai.operations.getVideosOperation({ operation });

      if (operation.error) {
        throw new Error(`Veo API Error: ${operation.error.message ?? 'Unknown error'}`);
      }
    }

    if (operation.error) {
      throw new Error(`Veo API Error: ${operation.error.message ?? 'Unknown error'}`);
    }

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!generatedVideo) {
      throw new Error('Video generato ma nessun payload video restituito da Veo 3.1.');
    }

    const downloadedVideo = await downloadGeneratedVideoBase64(ai, generatedVideo);
    return NextResponse.json(downloadedVideo);
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

    console.error('[ugc/video]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno' },
      { status: 500 },
    );
  }
}
