'use client';

import dynamic from 'next/dynamic';

const SignInContent = dynamic(() => import('@/src/features/Login'), {
  ssr: false,
  loading: () => <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento login...</div>,
});

export default function SignInShell() {
  return <SignInContent />;
}
