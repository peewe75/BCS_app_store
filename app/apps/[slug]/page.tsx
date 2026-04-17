import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AppLandingPage from '@/src/components/apps/AppLandingPage';
import { getPublicAppById, getPublicApps } from '@/src/lib/catalog';
import { JsonLd, appLd } from '@/src/components/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const APP_META: Record<string, { title: string; description: string }> = {
  ugc: {
    title: 'UGC Ad Creator — Genera Video Pubblicitari AI in 60 Secondi',
    description:
      'Trasforma una foto in un video pubblicitario professionale in 60 secondi con Google Gemini. Perfetto per TikTok, Instagram e campagne social. Freemium.',
  },
  'ai-crisi': {
    title: "AI Crisi — Gestione Procedure CCII per Avvocati Italiani",
    description:
      "Gestisci le procedure di crisi d'impresa secondo il Codice della Crisi (CCII) con AI: fascicolo digitale, knowledge base giuridica e generazione atti. 14 giorni gratis.",
  },
  trading: {
    title: 'Dichiarazione Trading — Report Fiscale AI per Trader Italiani',
    description:
      'Carica i dati del tuo broker e ottieni un report fiscale professionale per la dichiarazione dei redditi. Calcolo P&L automatico. Da €9,90.',
  },
  ravvedimento: {
    title: 'RavvedimentoFacile — Calcolo Sanzioni Ravvedimento Operoso 2025',
    description:
      'Calcola sanzione, interessi e importo totale da versare per il ravvedimento operoso. Normativa 2025 aggiornata, risultato in pochi secondi. Gratuito.',
  },
  'crypto-fiscale': {
    title: 'Crypto Fiscale — Dichiarazione Crypto Automatica per Trader Italiani',
    description:
      'Carica i report HTML dei tuoi exchange (Binance, Bybit) e ottieni i quadri RW/RT compilati con calcolo LIFO. Normativa 2025/2026.',
  },
  forf: {
    title: 'Forfettari AI — Calcola le Tasse Regime Forfettario Gratis',
    description:
      'Calcola le tasse del regime forfettario in modo corretto e aggiornato. Soglie 2025, codici ATECO, casse professionali. Completamente gratuito.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = APP_META[slug];

  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{ url: `/og/og-${slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export async function generateStaticParams() {
  const apps = await getPublicApps();
  return apps.map((app) => ({ slug: app.id }));
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getPublicAppById(slug);

  if (!app) {
    notFound();
  }

  // app is non-null here: notFound() always throws at runtime.
  // Non-null assertion because the local TS server doesn't resolve next types correctly.
  return (
    <>
      <JsonLd data={appLd(app!)} />
      <AppLandingPage app={app!} />
    </>
  );
}

