'use client';

import dynamic from 'next/dynamic';

const AdminContent = dynamic(() => import('@/src/components/admin/AdminConsole'), {
  ssr: false,
  loading: () => <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento console admin...</div>,
});

export default function AdminShell() {
  return <AdminContent />;
}
