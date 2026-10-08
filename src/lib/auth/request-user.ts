import { hasClerkServerConfig } from '@/src/lib/env';
import { env } from '@/src/lib/env';
import { createHmac, timingSafeEqual } from 'node:crypto';

export type RequestUser = { userId: string; role: string; source: 'swa' | 'clerk' };

export function getTrustedSwaUser(headers: Headers): RequestUser | null {
  const userId = headers.get('x-swa-user-id')?.trim() || '';
  const email = headers.get('x-swa-user-email')?.trim() || '';
  const role = headers.get('x-swa-user-role')?.trim() || 'user';
  const timestamp = headers.get('x-swa-auth-time')?.trim() || '';
  const received = headers.get('x-swa-auth-signature')?.trim() || '';
  if (!userId || !timestamp || !received || !env.swaSsoSecret) return null;
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > 120_000) return null;
  const expected = createHmac('sha256', env.swaSsoSecret).update(`${userId}\n${email}\n${role}\n${timestamp}`).digest('hex');
  const a = Buffer.from(received, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { userId, role, source: 'swa' };
}

export async function getRequestUser(request: Request): Promise<RequestUser | null> {
  const swaUser = getTrustedSwaUser(request.headers);
  if (swaUser) return swaUser;
  if (!hasClerkServerConfig()) return null;
  const { auth, currentUser } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return { userId, role: String(user?.publicMetadata?.role || 'user'), source: 'clerk' };
}

export function requestGeminiKey(request: Request, allowServerFallback = false) {
  return request.headers.get('x-ugc-gemini-key')?.trim()
    || (allowServerFallback ? process.env.GEMINI_API_KEY?.trim() : '')
    || '';
}
