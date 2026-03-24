import { notFound } from 'next/navigation';
import AppLandingPage from '@/src/components/apps/AppLandingPage';
import { getPublicAppById } from '@/src/lib/catalog';

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

  return <AppLandingPage app={app} />;
}
