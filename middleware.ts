import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { env } from '@/src/lib/env';

async function hasTrustedSwaIdentity(request: NextRequest) {
  const userId = request.headers.get('x-swa-user-id')?.trim() || '';
  const email = request.headers.get('x-swa-user-email')?.trim() || '';
  const role = request.headers.get('x-swa-user-role')?.trim() || 'user';
  const timestamp = request.headers.get('x-swa-auth-time')?.trim() || '';
  const received = request.headers.get('x-swa-auth-signature')?.trim() || '';
  if (!userId || !timestamp || !received || !env.swaSsoSecret) return false;
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > 120_000) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.swaSsoSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const signature = Uint8Array.from(received.match(/.{1,2}/g) || [], value => Number.parseInt(value, 16));
  return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(`${userId}\n${email}\n${role}\n${timestamp}`));
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // nextUrl.pathname excludes the configured /tools basePath.
  const path = request.nextUrl.pathname;
  if (await hasTrustedSwaIdentity(request)) return NextResponse.next();
  // Catalogues are public. Webhooks authenticate their raw payload themselves.
  if (path === '/api/public/catalog' || path === '/api/webhooks/stripe' || path === '/api/webhooks/clerk') {
    return NextResponse.next();
  }
  const publishableKey = env.clerkPublishableKey;
  const secretKey = env.clerkSecretKey;
  if (!publishableKey || !secretKey) {
    const protectedRoute = path.startsWith('/api/') || path === '/admin' || path.startsWith('/admin/')
      || path === '/dashboard' || path.startsWith('/dashboard/')
      || (Boolean(publishableKey) && path.startsWith('/workspace/'));
    if (protectedRoute) {
      return NextResponse.json({ error: 'Servizio di accesso non configurato' }, { status: 503 });
    }
    return NextResponse.next();
  }
  // Load Clerk only after confirming both keys. Importing it eagerly makes even
  // the public catalogue fail at the Edge when the private auth is not configured.
  const { clerkMiddleware } = await import('@clerk/nextjs/server');
  return clerkMiddleware({ publishableKey, secretKey })(request, event);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/((?!public/catalog|webhooks/stripe|webhooks/clerk).*)',
  ],
};
