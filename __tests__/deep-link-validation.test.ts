import { isValidDeepLink, ALLOWED_DEEP_LINK_PATHS } from '@/lib/deep-link';

describe('Deep Link Validation', () => {
  describe('Valid deep links', () => {
    it('accepts relative paths to allowed routes', () => {
      for (const path of ALLOWED_DEEP_LINK_PATHS) {
        expect(isValidDeepLink(path)).toBe(true);
      }
    });

    it('accepts app scheme URLs to allowed routes', () => {
      expect(isValidDeepLink('dreamseeker://tasks')).toBe(true);
      expect(isValidDeepLink('dreamseeker://profile')).toBe(true);
      expect(isValidDeepLink('dreamseeker://settings')).toBe(true);
    });

    it('accepts subroutes of allowed paths', () => {
      expect(isValidDeepLink('/settings/notifications')).toBe(true);
      expect(isValidDeepLink('/tasks/123')).toBe(true);
      expect(isValidDeepLink('dreamseeker://settings/account')).toBe(true);
    });

    it('accepts paths with query parameters', () => {
      expect(isValidDeepLink('/tasks?sort=date')).toBe(true);
      expect(isValidDeepLink('/settings?tab=notifications')).toBe(true);
      expect(isValidDeepLink('dreamseeker://subscribe?plan=pro')).toBe(true);
    });
  });

  describe('Invalid deep links - injection attempts', () => {
    it('rejects external URLs', () => {
      expect(isValidDeepLink('https://malicious-site.com')).toBe(false);
      expect(isValidDeepLink('http://phishing.com/tasks')).toBe(false);
    });

    it('rejects protocol-relative URLs', () => {
      expect(isValidDeepLink('//malicious.com/tasks')).toBe(false);
    });

    it('rejects other schemes', () => {
      expect(isValidDeepLink('tel:+1234567890')).toBe(false);
      expect(isValidDeepLink('mailto:evil@example.com')).toBe(false);
      expect(isValidDeepLink('javascript:alert(1)')).toBe(false);
    });

    it('rejects non-whitelisted routes', () => {
      expect(isValidDeepLink('/admin')).toBe(false);
      expect(isValidDeepLink('/api/users')).toBe(false);
      expect(isValidDeepLink('dreamseeker://admin')).toBe(false);
    });

    it('rejects invalid values', () => {
      expect(isValidDeepLink('')).toBe(false);
      expect(isValidDeepLink(null as any)).toBe(false);
      expect(isValidDeepLink(undefined as any)).toBe(false);
    });

    it('rejects path traversal', () => {
      expect(isValidDeepLink('/tasks/../admin')).toBe(false);
      expect(isValidDeepLink('/tasks/../../etc/passwd')).toBe(false);
    });
  });
});
