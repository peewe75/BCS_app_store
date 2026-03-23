// Server-side API client — all Gemini calls go through Next.js API routes
// so the GEMINI_API_KEY never reaches the browser

export async function generateLifestylePrompt(params: {
  imagesBase64: string[];
  style: string;
  chaos: number;
  targetAudience: string;
  platform: string;
  ugcStyle: string;
  language: string;
  dimensions: { width: string; height: string; unit: string };
  promptLanguage: string;
}): Promise<string> {
  const res = await fetch('/api/ugc/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Errore generazione prompt');
  }
  const data = (await res.json()) as { prompt: string };
  return data.prompt;
}

export async function generateLifestyleImage(params: {
  prompt: string;
  referenceImageBase64: string | null;
  mode: 'quality' | 'speed';
  aspectRatio: string;
}): Promise<string> {
  const res = await fetch('/api/ugc/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Errore generazione immagine');
  }
  const data = (await res.json()) as { image: string };
  return data.image;
}

export async function generateVideoPrompt(params: {
  generatedImageBase64: string;
  ugcStyle: string;
  platform: string;
  language: string;
  promptLanguage: string;
}): Promise<string> {
  const res = await fetch('/api/ugc/video-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Errore generazione prompt video');
  }
  const data = (await res.json()) as { prompt: string };
  return data.prompt;
}

export async function generateVeoVideo(params: {
  imageBase64: string;
  prompt: string;
}): Promise<string> {
  const res = await fetch('/api/ugc/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Errore generazione video');
  }
  const data = (await res.json()) as { videoBase64: string };
  // Convert base64 to blob URL so the browser can play it
  const bytes = atob(data.videoBase64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}
