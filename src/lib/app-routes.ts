export const TRADING_MARKETING_HOME_URL =
  'https://dichiarazionetrading.netlify.app/home_page_cupertino_premium/code.html';

export function getAppPublicRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/apps/${slug}`;
}

export function getAppWorkspaceRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/workspace/${slug}`;
}

export function getContextualSignOutUrl(pathname?: string | null) {
  if (pathname?.startsWith('/apps/trading') || pathname?.startsWith('/workspace/trading')) {
    return TRADING_MARKETING_HOME_URL;
  }

  return '/';
}
