// Server-side API client: all Gemini calls go through Next.js API routes
// so the GEMINI_API_KEY never reaches the browser.

export class InsufficientCreditsError extends Error {
  required: number;
  available: number;

  constructor(message: string, required: number, available: number) {
    super(message);
    this.name = 'InsufficientCreditsError';
    this.required = required;
    this.available = available;
  }
}

function parseInsufficientCreditsMessage(message: string, fallbackRequired: number) {
  const match = message.match(/richiede\s+(\d+)\s+crediti\s+\(hai\s+(\d+)\)/i);

  return {
    required: match ? Number.parseInt(match[1], 10) : fallbackRequired,
    available: match ? Number.parseInt(match[2], 10) : 0,
  };
}

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
  aspectRatio: string;
}): Promise<string> {
  const res = await fetch('/api/ugc/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, mode: 'speed' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { error?: string }).error ?? 'Errore generazione immagine';

    if (res.status === 402) {
      const parsed = parseInsufficientCreditsMessage(message, 25);
      throw new InsufficientCreditsError(message, parsed.required, parsed.available);
    }

    throw new Error(message);
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
    const message = (err as { error?: string }).error ?? 'Errore generazione video';

    if (res.status === 402) {
      const parsed = parseInsufficientCreditsMessage(message, 75);
      throw new InsufficientCreditsError(message, parsed.required, parsed.available);
    }

    throw new Error(message);
  }

  const data = (await res.json()) as { videoBase64: string };

  // Convert base64 to blob URL so the browser can play it.
  const bytes = atob(data.videoBase64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    arr[i] = bytes.charCodeAt(i);
  }

  const blob = new Blob([arr], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}
