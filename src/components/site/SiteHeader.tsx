import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Logo from '@/src/components/Logo';

export function SiteHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(18px)',
        background: 'rgba(245,245,247,0.82)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo variant="dark" size="md" />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Utenti NON loggati: solo Accedi + Inizia gratis */}
          <SignedOut>
            <Link
              href="/sign-in"
              style={{
                color: '#1D1D1F',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              Accedi
            </Link>
            <Link
              href="/sign-up"
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 999,
                background: '#3713ec',
              }}
            >
              Inizia gratis
            </Link>
          </SignedOut>

          {/* Utenti loggati: Dashboard + UserButton Clerk */}
          <SignedIn>
            <Link
              href="/dashboard"
              style={{
                color: '#1D1D1F',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: { width: 36, height: 36 },
                },
              }}
            />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
