export const TRADING_MARKETING_HOME_URL =
  'https://dichiarazionetrading.netlify.app/home_page_cupertino_premium/code.html';

export const DASHBOARD_ROUTE = '/dashboard';

const INTERNAL_APP_SLUGS = new Set(['ugc', 'trading', 'ravvedimento', 'forf', 'crypto-fiscale']);

const EXTERNAL_APP_ENTRY_URLS: Record<string, string> = {
  'ai-crisi': 'https://ai-crisi.vercel.app',
  'legal-ai-penale': 'https://legal-ai-penale.netlify.app/dashboard',
  softi: 'https://softi-ai-analyzer.onrender.com',
};

const ALLOWED_EXTERNAL_REDIRECT_HOSTS = new Set([
  'ai-crisi.vercel.app',
  'legal-ai-penale.netlify.app',
  'softi-ai-analyzer.onrender.com',
]);

export function getAppPublicRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/apps/${slug}`;
}

export function getAppWorkspaceRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/workspace/${slug}`;
}

export function getAppPostAuthTarget(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;

  if (INTERNAL_APP_SLUGS.has(slug)) {
    return getAppWorkspaceRoute(slug);
  }

  return EXTERNAL_APP_ENTRY_URLS[slug] ?? DASHBOARD_ROUTE;
}

export function getAuthRedirectTargetForPathname(pathname?: string | null) {
  if (!pathname) {
    return DASHBOARD_ROUTE;
  }

  const appMatch = pathname.match(/^\/apps\/([^/?#]+)/);
  if (appMatch) {
    return getAppPostAuthTarget(appMatch[1]);
  }

  const workspaceMatch = pathname.match(/^\/workspace\/([^/?#]+)/);
  if (workspaceMatch) {
    return getAppWorkspaceRoute(workspaceMatch[1]);
  }

  return DASHBOARD_ROUTE;
}

function isAllowedExternalRedirectHost(hostname: string) {
  if (ALLOWED_EXTERNAL_REDIRECT_HOSTS.has(hostname)) {
    return true;
  }

  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function sanitizeRedirectTarget(rawTarget?: string | null) {
  if (!rawTarget) {
    return null;
  }

  const target = rawTarget.trim();
  if (!target) {
    return null;
  }

  if (target.startsWith('/')) {
    return target.startsWith('//') ? null : target;
  }

  try {
    const url = new URL(target);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return isAllowedExternalRedirectHost(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function buildAuthHref(mode: 'sign-in' | 'sign-up', redirectTarget?: string | null) {
  const target = sanitizeRedirectTarget(redirectTarget) ?? DASHBOARD_ROUTE;
  return `/${mode}?redirect_url=${encodeURIComponent(target)}`;
}

export function buildContextualAuthHref(mode: 'sign-in' | 'sign-up', pathname?: string | null) {
  return buildAuthHref(mode, getAuthRedirectTargetForPathname(pathname));
}

export function getContextualSignOutUrl(pathname?: string | null) {
  if (pathname?.startsWith('/apps/trading') || pathname?.startsWith('/workspace/trading')) {
    return TRADING_MARKETING_HOME_URL;
  }

  return '/';
}
