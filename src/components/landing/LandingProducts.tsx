'use client';

import React from 'react';
import type { AppRecord } from '@/src/lib/catalog';
import { getAppPublicRoute } from '@/src/lib/app-routes';
import ProductSection from '@/src/components/ProductSection';

interface LandingProductsProps {
  apps: AppRecord[];
}

/** Action-verb CTA per app — CRO best practice: verbo d'azione > "Scopri" */
const APP_CTA: Record<string, string> = {
  ugc: 'Genera il tuo primo video',
  'ai-crisi': 'Prova 14 giorni gratis',
  trading: 'Genera il tuo report',
  ravvedimento: 'Calcola adesso',
  forf: 'Calcola le tue tasse',
  softi: 'Apri Softi AI',
};

export default function LandingProducts({ apps }: LandingProductsProps) {
  // Only show apps that have video or poster content
  const productApps = apps.filter((app) => !app.is_coming_soon);

  return (
    <div>
      {productApps.map((app) => (
        <ProductSection
          key={app.id}
          id={app.id}
          category={app.category ?? 'App'}
          name={app.name}
          tagline={app.tagline ?? ''}
          description={app.description ?? ''}
          features={app.features ?? []}
          accentColor={app.accent_color ?? '#3713ec'}
          pricingBadge={app.pricing_badge ?? ''}
          ctaText={APP_CTA[app.id] ?? `Scopri ${app.name}`}
          ctaHref={getAppPublicRoute(app)}
          videoSrc={app.video_src ?? undefined}
          posterSrc={app.poster_src ?? undefined}
          layout={app.layout}
          bgColor={app.bg_color ?? '#F5F5F7'}
        />
      ))}
    </div>
  );
}
