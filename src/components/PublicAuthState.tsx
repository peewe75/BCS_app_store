'use client';

import type { ReactNode } from 'react';
import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/nextjs';
import { env } from '@/src/lib/env';

// Public pages can render without an authentication provider in local preview.
// This does not grant access to any protected route or API.
export function SignedIn({ children }: { children: ReactNode }) {
  return env.clerkPublishableKey ? <ClerkSignedIn>{children}</ClerkSignedIn> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return env.clerkPublishableKey ? <ClerkSignedOut>{children}</ClerkSignedOut> : <>{children}</>;
}
