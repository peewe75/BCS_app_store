import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/src/lib/env';
import { SiteHeader } from '@/src/components/site/SiteHeader';
import { SiteFooter } from '@/src/components/site/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ultrabot Space',
  description: 'Piattaforma unificata su Vercel con Clerk, Supabase e Stripe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        {env.clerkPublishableKey ? (
          <ClerkProvider publishableKey={env.clerkPublishableKey}>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ClerkProvider>
        ) : (
          <>
            <SiteHeader />
            {children}
            <SiteFooter />
          </>
        )}
      </body>
    </html>
  );
}
