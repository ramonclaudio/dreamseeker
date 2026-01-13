export const ALLOWED_DEEP_LINK_PATHS = [
  '/tasks',
  '/profile',
  '/settings',
  '/explore',
  '/history',
  '/subscribe',
] as const;

export function isValidDeepLink(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('..')) return false;
  const isRelativePath = url.startsWith('/') && !url.startsWith('//');
  const isAppScheme = url.startsWith('expostarterapp://');
  if (!isRelativePath && !isAppScheme) return false;
  const path = isAppScheme ? '/' + url.replace('expostarterapp://', '').split('?')[0] : url.split('?')[0];
  return ALLOWED_DEEP_LINK_PATHS.some((allowed) => path === allowed || path.startsWith(allowed + '/'));
}
