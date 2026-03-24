import type { AppLandingContent, AppLandingSection, AppRecord } from '@/src/lib/catalog';

function stripLeadingEmoji(value: string) {
  return value.replace(/^\p{Extended_Pictographic}\s*/u, '').trim();
}

function buildDefaultBullets(app: AppRecord) {
  const featureBullets = (app.features ?? [])
    .map(stripLeadingEmoji)
    .filter(Boolean);

  if (featureBullets.length > 0) {
    return featureBullets;
  }

  return [
    `${app.name} centralizza il flusso operativo in un ambiente unico.`,
    `Il team lavora con una struttura piu chiara e con meno passaggi manuali.`,
    `Il percorso di accesso resta coerente con il catalogo BCS AI.`,
  ];
}

function buildDefaultSections(app: AppRecord): AppLandingSection[] {
  const bullets = buildDefaultBullets(app);

  return [
    {
      id: 'overview',
      title: `Cosa ottieni con ${app.name}`,
      body:
        app.description ||
        `${app.name} e progettata per trasformare un bisogno operativo ricorrente in un flusso piu lineare, leggibile e rapido da gestire.`,
      bullets: bullets.slice(0, 3),
    },
    {
      id: 'workflow',
      title: 'Come entra nel flusso di lavoro',
      body: `${app.name} si inserisce nel catalogo BCS AI come modulo operativo dedicato, con accesso, media e pricing allineati alla landing principale.`,
      bullets: [
        'Accesso da una pagina pubblica dedicata prima dell ingresso nel workspace.',
        'Contesto piu chiaro per utenti nuovi, clienti e team interni.',
        'CTA finali orientate all uso reale dell app o al percorso di accesso.',
      ],
    },
  ];
}

function buildDefaultBenefits(app: AppRecord) {
  return buildDefaultBullets(app).slice(0, 4);
}

export function getAppLandingContent(app: AppRecord): AppLandingContent {
  const fallback: AppLandingContent = {
    eyebrow: app.category ?? 'BCS AI App',
    headline: app.name,
    subheadline:
      app.tagline ||
      app.description ||
      `${app.name} fa parte del catalogo BCS AI con un percorso di accesso dedicato e una pagina informativa autonoma.`,
    trustLine:
      app.price_label ||
      app.pricing_badge ||
      'Catalogo unificato, accesso coerente e presentazione dedicata per ogni app.',
    primaryCtaLabel: app.is_internal ? `Accedi a ${app.name}` : app.cta_text || `Visita ${app.name}`,
    secondaryCtaLabel: 'Scopri le funzionalita',
    problemTitle: `Perche scegliere ${app.name}`,
    problemBody:
      app.description ||
      `${app.name} nasce per ridurre passaggi dispersi, chiarire il valore del prodotto e rendere piu semplice il percorso dalla scoperta all utilizzo.`,
    sections: buildDefaultSections(app),
    benefitsTitle: 'Valore immediato',
    benefits: buildDefaultBenefits(app),
    audienceTitle: 'Per chi e pensata',
    audienceBody:
      'Per professionisti, team e clienti che hanno bisogno di un punto di accesso piu chiaro prima di entrare nel prodotto.',
    pricingTitle: 'Accesso',
    pricingLine: app.price_label || app.pricing_badge || 'Informazioni pricing disponibili nella scheda dedicata.',
    supportLine: app.is_internal
      ? 'Dopo l accesso, il sistema reindirizza direttamente al workspace corretto.'
      : 'Dalla pagina illustrativa puoi continuare verso il prodotto esterno.',
    closingHeadline: `Entra in ${app.name} con il percorso corretto`,
    closingBody:
      app.is_internal
        ? `Prima capisci cosa fa ${app.name}, poi accedi al workspace con un flusso piu pulito e coerente.`
        : `Prima scopri il valore di ${app.name}, poi prosegui verso il prodotto esterno con un contesto chiaro.`,
    finalCtaLabel: app.is_internal ? `Apri ${app.name}` : app.cta_text || `Vai a ${app.name}`,
  };

  return {
    ...fallback,
    ...app.landing_content,
    sections: app.landing_content?.sections?.length ? app.landing_content.sections : fallback.sections,
    benefits: app.landing_content?.benefits?.length ? app.landing_content.benefits : fallback.benefits,
  };
}
