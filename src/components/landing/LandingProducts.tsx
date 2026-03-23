'use client';

import React from 'react';
import type { AppRecord } from '@/src/lib/catalog';
import ProductSection from '@/src/components/ProductSection';

interface LandingProductsProps {
  apps: AppRecord[];
}

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
          ctaText={app.cta_text ?? 'Scopri'}
          ctaHref={
            app.is_internal
              ? app.internal_route ?? `/apps/${app.id}`
              : app.cta_href ?? '#'
          }
          videoSrc={app.video_src ?? undefined}
          posterSrc={app.poster_src ?? undefined}
          layout={app.layout}
          bgColor={app.bg_color ?? '#F5F5F7'}
        />
      ))}
    </div>
  );
}
