import { getPublicApps } from '@/src/lib/catalog';
import LandingHero from '@/src/components/landing/LandingHero';
import LandingProducts from '@/src/components/landing/LandingProducts';
import LandingComingSoon from '@/src/components/landing/LandingComingSoon';

export default async function HomePage() {
  const apps = await getPublicApps();
  const activeApps = apps.filter((app) => !app.is_coming_soon);
  const comingSoonApps = apps.filter((app) => app.is_coming_soon);

  return (
    <main>
      <LandingHero />
      <LandingProducts apps={activeApps} />
      <LandingComingSoon apps={comingSoonApps} />
    </main>
  );
}
