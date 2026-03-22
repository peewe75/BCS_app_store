import React, { lazy, type ComponentType } from 'react';

/* ─── App Registry ──────────────────────────────────────────────
   Maps app IDs to their lazy-loaded React components.
   When integrating a new app, add its entry here.
   External apps (like AI Crisi) are handled by redirect in AppShell.
   ─────────────────────────────────────────────────────────────── */

export interface AppRegistryEntry {
  component: React.LazyExoticComponent<ComponentType<any>>;
  label: string;
}

const registry: Record<string, AppRegistryEntry> = {
  // ─── Currently available (placeholder pages) ──────────────
  clip: {
    component: lazy(() => import('../pages/ClipApp')),
    label: 'UGC Ad Creator',
  },
  forf: {
    component: lazy(() => import('../pages/ForfApp')),
    label: 'Forfettari AI',
  },
  bot: {
    component: lazy(() => import('../pages/BotApp')),
    label: 'Bot AI',
  },
  prompt: {
    component: lazy(() => import('../pages/PromptApp')),
    label: 'Prompt Lab',
  },

  // ─── Future integrated apps (uncomment when ready) ────────
  // trading: {
  //   component: lazy(() => import('../pages/TradingApp')),
  //   label: 'Trading Fiscale',
  // },
  // ravvedimento: {
  //   component: lazy(() => import('../pages/RavvedimentoApp')),
  //   label: 'RavvedimentoFacile',
  // },
  // ugc: {
  //   component: lazy(() => import('../pages/UgcApp')),
  //   label: 'UGC Ad Creator',
  // },
};

/* ─── External redirects ──────────────────────────────────────── */
export const externalRedirects: Record<string, string> = {
  'ai-crisi': 'https://ai-crisi.vercel.app',
};

export default registry;
