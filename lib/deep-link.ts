const APP_SCHEME = 'dreamseeker';

export const ALLOWED_DEEP_LINK_PATHS = [
  '/today',
  '/dream',
  '/journal',
  '/progress',
  '/dashboard',
  '/focus-timer',
  '/create-dream',
  '/subscribe',
  '/onboarding',
  '/dream-complete',
  '/reset-password',
] as const;

export function isValidDeepLink(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('..')) return false;
  const isRelativePath = url.startsWith('/') && !url.startsWith('//');
  const isAppScheme = url.startsWith(`${APP_SCHEME}://`);
  if (!isRelativePath && !isAppScheme) return false;
  const path = isAppScheme ? '/' + url.replace(`${APP_SCHEME}://`, '').split('?')[0] : url.split('?')[0];
  return ALLOWED_DEEP_LINK_PATHS.some((allowed) => path === allowed || path.startsWith(allowed + '/'));
}
