import type { Metadata } from 'next';
import FiscaleLanding from '@/src/components/apps/fiscale/FiscaleLanding';

export const metadata: Metadata = {
  title: 'Strumenti Fiscali AI — Trading e Crypto | BCS AI Suite',
  description:
    'Dichiarazione Trading per forex/MetaTrader e Crypto Fiscale per exchange. Report fiscali, quadri RW/RT e calcolo plusvalenze. Tutto in un unico ecosistema.',
  openGraph: {
    title: 'Strumenti Fiscali AI — Trading e Crypto | BCS AI Suite',
    description:
      'Dichiarazione Trading per forex/MetaTrader e Crypto Fiscale per exchange. Report fiscali, quadri RW/RT e calcolo plusvalenze.',
    images: [{ url: '/og/og-fiscale.png', width: 1200, height: 630, alt: 'BCS AI Suite - Strumenti Fiscali' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strumenti Fiscali AI — Trading e Crypto | BCS AI Suite',
    description: 'Report fiscali per trading forex e criptovalute. Quadri RW/RT pronti per la dichiarazione.',
  },
};

export default function FiscalePage() {
  return <FiscaleLanding />;
}
