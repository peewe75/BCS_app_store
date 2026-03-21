import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
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

      {/* Clerk SignIn component with custom appearance */}
      <SignIn
        routing="path"
        path="/login"
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

export default Login;
