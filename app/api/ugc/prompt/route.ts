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
      imagesBase64: string[];
      style: string;
      chaos: number;
      targetAudience: string;
      platform: string;
      ugcStyle: string;
      language: string;
      dimensions: { width: string; height: string; unit: string };
      promptLanguage: string;
    };

    const ai = new GoogleGenAI({ apiKey });

    const imageParts = body.imagesBase64.map((img: string) => {
      const data = img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      return { inlineData: { mimeType: 'image/png' as const, data } };
    });

    let creativityInstruction = 'Balance creativity with product clarity.';
    if (body.chaos < 30) creativityInstruction = 'Be conservative. Focus strictly on a traditional product showcase.';
    else if (body.chaos > 70) creativityInstruction = 'Be highly creative and dynamic. Use unexpected angles or dramatic lighting.';

    const dimensionContext = (body.dimensions.width && body.dimensions.height)
      ? `Physical Size: ${body.dimensions.width}x${body.dimensions.height} ${body.dimensions.unit}.`
      : 'Physical Size: Not specified.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...imageParts,
          {
            text: `You are an expert Creative Director for high-end advertising.
Analyze these product images deeply. Combine visual information from all provided images.

Create a detailed image generation prompt to place THIS EXACT PRODUCT into a realistic, aspirational lifestyle scene.

CRITICAL CONSTRAINTS:
1. IDENTICAL PRODUCT: Preserve all logos, text, fonts, colors, material textures. State "Keep the product exactly as shown in the reference image".
2. ACCURATE SCALE: ${dimensionContext}

Campaign Strategy:
- Target Audience: ${body.targetAudience}
- Target Video Audio Language: ${body.language}
- Platform: ${body.platform}
- UGC Style: ${body.ugcStyle}

Visual Configuration:
- Target Art Style: ${body.style}
- Creativity: ${creativityInstruction} (Level ${body.chaos}/100)

Instructions:
1. Describe the scene environment to fit '${body.ugcStyle}'.
2. Explicitly describe the placement of the product.
3. Add: "The object in the provided reference image must be composited into this scene unchanged."
4. Ensure lighting matches '${body.style}'.
5. IMPORTANT: Write the final output prompt in ${body.promptLanguage}.

Output ONLY the image generation prompt text.`,
          },
        ],
      },
    });

    const prompt = response.text ?? 'A high quality photo of the product.';
    return NextResponse.json({ prompt });
  } catch (err) {
    console.error('[ugc/prompt]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore interno' }, { status: 500 });
  }
}
