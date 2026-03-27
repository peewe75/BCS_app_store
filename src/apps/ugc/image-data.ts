export const SUPPORTED_UGC_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

type SupportedUgcImageMimeType = (typeof SUPPORTED_UGC_IMAGE_MIME_TYPES)[number];

export class InvalidUgcImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUgcImageError';
  }
}

export function extractSupportedImageBase64(imageDataUrl: string): {
  mimeType: SupportedUgcImageMimeType;
  data: string;
} {
  const trimmedValue = imageDataUrl.trim();
  const match = trimmedValue.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);

  if (!match) {
    throw new InvalidUgcImageError('Formato immagine non valido. Carica PNG, JPG o WEBP.');
  }

  const rawMimeType = match[1].toLowerCase();
  const mimeType = rawMimeType === 'image/jpg' ? 'image/jpeg' : rawMimeType;

  if (
    !SUPPORTED_UGC_IMAGE_MIME_TYPES.includes(
      mimeType as SupportedUgcImageMimeType,
    )
  ) {
    throw new InvalidUgcImageError('Formato immagine non supportato. Carica PNG, JPG o WEBP.');
  }

  const data = match[2].replace(/\s+/g, '');
  if (!data || !/^[A-Za-z0-9+/=]+$/.test(data)) {
    throw new InvalidUgcImageError('Immagine non valida. Prova a ricaricare il file.');
  }

  return {
    mimeType: mimeType as SupportedUgcImageMimeType,
    data,
  };
}
