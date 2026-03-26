import type { Metadata } from 'next';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/src/lib/env';
import { SiteHeader } from '@/src/components/site/SiteHeader';
import { SiteFooter } from '@/src/components/site/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bcs-ai.com'),
  title: {
    default: 'BCS AI Suite — Strumenti AI per Professionisti Italiani',
    template: '%s | BCS AI Suite',
  },
  description:
    "Suite di 5 tool AI verticali per avvocati, commercialisti e creator italiani. Report fiscali, crisi d'impresa, ravvedimento operoso e video UGC con Google Gemini.",
  keywords: ['AI', 'strumenti AI', 'avvocati', 'commercialisti', 'trading fiscale', 'ravvedimento operoso', 'regime forfettario', 'UGC video', 'crisi impresa', 'CCII'],
  authors: [{ name: 'BCS Advisory' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'BCS AI Suite',
    title: 'BCS AI Suite — Strumenti AI per Professionisti Italiani',
    description:
      "Suite di 5 tool AI verticali per avvocati, commercialisti e creator italiani. Powered by Google Gemini.",
    images: [{ url: '/og/og-default.png', width: 1200, height: 630, alt: 'BCS AI Suite' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BCS AI Suite — Strumenti AI per Professionisti Italiani',
    description: "Suite di 5 tool AI verticali per professionisti italiani. Powered by Google Gemini.",
    images: ['/og/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <Script
          id="gtag-shim"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: 'window.gtag = window.gtag || function(){};' }}
        />
      </head>
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
