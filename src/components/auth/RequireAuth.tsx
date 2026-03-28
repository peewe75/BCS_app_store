'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useAdminStatus } from '@/src/hooks/useAdminStatus';

export function RequireAuth({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, isLoadingAdmin } = useAdminStatus();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    if (requireAdmin && isLoadingAdmin) {
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isLoaded, isLoadingAdmin, isSignedIn, requireAdmin, router]);

  if (!isLoaded || (requireAdmin && isLoadingAdmin)) {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento sessione...</div>;
  }

  if (!isSignedIn) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Serve un account per continuare.</p>
        <SignInButton mode="redirect">
          <button
            type="button"
            style={{
              border: 'none',
              borderRadius: 999,
              background: '#3713ec',
              color: '#fff',
              padding: '12px 20px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Vai al login
          </button>
        </SignInButton>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}>Accesso admin richiesto.</div>;
  }

  return <>{children}</>;
}
