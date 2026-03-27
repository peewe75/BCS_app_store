import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  extractSupportedImageBase64,
  InvalidUgcImageError,
} from '@/src/apps/ugc/image-data';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  try {
    const body = (await req.json()) as {
      generatedImageBase64: string;
      ugcStyle: string;
      platform: string;
      language: string;
      promptLanguage: string;
    };

    const ai = new GoogleGenAI({ apiKey });
    const { mimeType, data } = extractSupportedImageBase64(body.generatedImageBase64);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          {
        text: `Analyze this lifestyle image. Create a Veo 3 video generation prompt.

Context:
- Format: ${body.ugcStyle}
- Platform: ${body.platform} (Adjust pacing/movement accordingly)
- Target Content Language: ${body.language}
- Output Prompt Language: ${body.promptLanguage}

Instructions:
1. Describe a video movement of roughly 8 seconds.
2. AUDIO / SPEECH: The prompt MUST explicitly request native audio. If there are people, they MUST speak in ${body.language}.
3. TIMING & ENDING: Duration ~8 seconds. The subject MUST stop speaking and moving completely by the 7th second. Last second must show subject static and silent for a clean ending.
4. IMPORTANT: Veo 3 prompts should be written in English. Write the final prompt in English, but keep all spoken dialogue explicitly in ${body.language}.

Output ONLY the prompt text.`,
          },
        ],
      },
    });

    const prompt = response.text ?? 'Cinematic slow motion shot with audio.';
    return NextResponse.json({ prompt });
  } catch (err) {
    if (err instanceof InvalidUgcImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[ugc/video-prompt]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
