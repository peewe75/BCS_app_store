'use client';

import dynamic from 'next/dynamic';

const AppAccessPage = dynamic(() => import('@/src/components/apps/AppAccessPage'), {
  ssr: false,
  loading: () => <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento app...</div>,
});

export default function AppShell({ slug }: { slug: string }) {
  return <AppAccessPage slug={slug} />;
}
