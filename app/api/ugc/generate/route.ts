import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { generateAppImage } from '@/src/services/geminiService';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Non autenticato.' }, { status: 401 });
  }

  const { prompt, style, productName } = await req.json();

  if (!prompt || !productName) {
    return NextResponse.json({ error: 'prompt e productName sono obbligatori.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Create job record
  const jobId = crypto.randomUUID();

  if (supabase) {
    await supabase.from('ugc_videos').insert({
      id: jobId,
      user_id: userId,
      product_image_url: null,
      video_url: null,
      status: 'processing',
      prompt,
      style: style || 'professional',
      product_name: productName,
    });
  }

  // Generate with Gemini
  const fullPrompt = `Create a professional UGC-style advertising image for the product "${productName}". Style: ${style || 'professional, modern'}. ${prompt}. The image should look like a real social media ad, high quality, vibrant colors.`;

  try {
    const imageDataUrl = await generateAppImage(fullPrompt);

    if (supabase && imageDataUrl) {
      await supabase
        .from('ugc_videos')
        .update({ status: 'completed', video_url: imageDataUrl })
        .eq('id', jobId);
    }

    return NextResponse.json({
      id: jobId,
      status: 'completed',
      imageUrl: imageDataUrl || null,
    });
  } catch (error) {
    if (supabase) {
      await supabase
        .from('ugc_videos')
        .update({ status: 'failed' })
        .eq('id', jobId);
    }

    return NextResponse.json({
      id: jobId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Errore nella generazione.',
    }, { status: 500 });
  }
}
