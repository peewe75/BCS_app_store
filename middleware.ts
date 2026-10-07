import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { env } from '@/src/lib/env';

const authenticate = clerkMiddleware({
  publishableKey: env.clerkPublishableKey,
  secretKey: env.clerkSecretKey,
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // nextUrl.pathname excludes the configured /tools basePath.
  const path = request.nextUrl.pathname;
  // Catalogues are public. Webhooks authenticate their raw payload themselves.
  if (path === '/api/public/catalog' || path === '/api/webhooks/stripe' || path === '/api/webhooks/clerk') {
    return NextResponse.next();
  }
  if (!env.clerkPublishableKey || !env.clerkSecretKey) {
    const protectedRoute = path.startsWith('/api/') || path === '/admin' || path.startsWith('/admin/')
      || path === '/dashboard' || path.startsWith('/dashboard/')
      || (Boolean(env.clerkPublishableKey) && path.startsWith('/workspace/'));
    if (protectedRoute) {
      return NextResponse.json({ error: 'Servizio di accesso non configurato' }, { status: 503 });
    }
    return NextResponse.next();
  }
  return authenticate(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|webp|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
