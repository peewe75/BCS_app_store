/**
 * JsonLd — server component per JSON-LD structured data (SEO).
 * Usato in app/layout.tsx (SoftwareApplication suite) e
 * app/apps/[slug]/page.tsx (per-app + BreadcrumbList).
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** JSON-LD per la suite principale (usato in layout.tsx) */
export const suiteLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BCS AI Suite',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://bcs-ai.com',
  description:
    "Suite di 5 tool AI verticali per professionisti italiani: procedure CCII, report fiscali, ravvedimento operoso, regime forfettario e video UGC con Google Gemini.",
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '30',
    priceCurrency: 'EUR',
    offerCount: 5,
  },
  publisher: {
    '@type': 'Organization',
    name: 'BCS Advisory',
    url: 'https://bcs-ai.com',
  },
  inLanguage: 'it',
};

/** JSON-LD per singola app (da passare alla pagina [slug]) */
export function appLd(app: {
  id: string;
  name: string;
  tagline: string | null;
  pricing_model: string | null;
  price_label: string | null;
}) {
  const priceMap: Record<string, { price: string; priceSpec?: string }> = {
    free: { price: '0' },
    freemium: { price: '0', priceSpec: 'Freemium — upgrade disponibile' },
    'one-time': { price: '9.90' },
    subscription: { price: '30' },
  };
  const pricing = priceMap[app.pricing_model ?? ''] ?? { price: '0' };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: app.name,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `https://bcs-ai.com/apps/${app.id}`,
        description: app.tagline ?? '',
        offers: {
          '@type': 'Offer',
          price: pricing.price,
          priceCurrency: 'EUR',
          description: pricing.priceSpec,
        },
        publisher: {
          '@type': 'Organization',
          name: 'BCS Advisory',
          url: 'https://bcs-ai.com',
        },
        inLanguage: 'it',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://bcs-ai.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: app.name,
            item: `https://bcs-ai.com/apps/${app.id}`,
          },
        ],
      },
    ],
  };
}
