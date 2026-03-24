'use client';

import React, { useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Logo from '../components/Logo';

const Signup: React.FC = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 40px',
      }}
    >
      {/* Logo above the form */}
      <div style={{ marginBottom: '32px' }}>
        <Logo variant="light" size="lg" />
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: '14px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        Un unico account per accedere a tutti i tuoi strumenti BCS AI
      </p>

      {/* Clerk SignUp component */}
      <SignUp
        routing="path"
        path="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#3713ec',
            colorBackground: '#0f0f0f',
            colorInputBackground: '#1a1a1a',
            colorInputText: '#ffffff',
            colorText: '#ffffff',
            colorTextSecondary: '#9ca3af',
            colorNeutral: '#374151',
            borderRadius: '12px',
            fontFamily: '"Inter", system-ui, sans-serif',
          },
          elements: {
            card: {
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            headerTitle: {
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            },
          },
        }}
      />
    </div>
  );
};

export default Signup;
