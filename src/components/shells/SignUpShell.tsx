'use client';

import dynamic from 'next/dynamic';

const SignUpContent = dynamic(() => import('@/src/features/Signup'), {
  ssr: false,
  loading: () => <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento registrazione...</div>,
});

export default function SignUpShell() {
  return <SignUpContent />;
}
