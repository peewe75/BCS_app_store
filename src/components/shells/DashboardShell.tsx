'use client';

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(
  () =>
    import('@/src/components/auth/RequireAuth').then(({ RequireAuth }) =>
      import('@/src/features/UserDashboard').then(({ default: UserDashboard }) => () => (
        <RequireAuth>
          <UserDashboard />
        </RequireAuth>
      )),
    ),
  {
    ssr: false,
    loading: () => <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento dashboard...</div>,
  },
);

export default function DashboardShell() {
  return <DashboardContent />;
}
