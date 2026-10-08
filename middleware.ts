import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { env } from '@/src/lib/env';

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // nextUrl.pathname excludes the configured /tools basePath.
  const path = request.nextUrl.pathname;
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
