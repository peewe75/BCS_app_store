export function getAppPublicRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/apps/${slug}`;
}

export function getAppWorkspaceRoute(appOrSlug: string | { id: string }) {
  const slug = typeof appOrSlug === 'string' ? appOrSlug : appOrSlug.id;
  return `/workspace/${slug}`;
}
