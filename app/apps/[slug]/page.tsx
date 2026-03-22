import AppShell from '@/src/components/shells/AppShell';

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AppShell slug={slug} />;
}
