import { isValidDeepLink, ALLOWED_DEEP_LINK_PATHS } from '@/lib/deep-link';

describe('Deep Link Validation', () => {
  // ── Valid deep links ────────────────────────────────────────────────────

  describe('Valid deep links', () => {
    it('accepts all allowed relative paths', () => {
      for (const path of ALLOWED_DEEP_LINK_PATHS) {
        expect(isValidDeepLink(path)).toBe(true);
      }
    });

    it('accepts app scheme URLs to allowed routes', () => {
      expect(isValidDeepLink('dreamseeker://today')).toBe(true);
      expect(isValidDeepLink('dreamseeker://dashboard')).toBe(true);
      expect(isValidDeepLink('dreamseeker://subscribe')).toBe(true);
      expect(isValidDeepLink('dreamseeker://journal')).toBe(true);
      expect(isValidDeepLink('dreamseeker://progress')).toBe(true);
    });

    it('accepts subroutes of allowed paths', () => {
      expect(isValidDeepLink('/dream/abc123')).toBe(true);
      expect(isValidDeepLink('/dream-complete/abc123')).toBe(true);
      expect(isValidDeepLink('dreamseeker://dream/abc123')).toBe(true);
    });

    it('accepts paths with query parameters', () => {
      expect(isValidDeepLink('/focus-timer?dreamId=abc')).toBe(true);
      expect(isValidDeepLink('/reset-password?token=xyz')).toBe(true);
      expect(isValidDeepLink('dreamseeker://subscribe?plan=pro')).toBe(true);
    });

    it('accepts paths with multiple query parameters', () => {
      expect(isValidDeepLink('/dream/123?tab=actions&view=detail')).toBe(true);
    });
  });

  // ── Invalid deep links — injection attempts ────────────────────────────

  describe('Injection prevention', () => {
    it('rejects external URLs', () => {
      expect(isValidDeepLink('https://malicious-site.com')).toBe(false);
      expect(isValidDeepLink('http://phishing.com/today')).toBe(false);
      expect(isValidDeepLink('https://evil.com/dream')).toBe(false);
    });

    it('rejects protocol-relative URLs', () => {
      expect(isValidDeepLink('//malicious.com/today')).toBe(false);
      expect(isValidDeepLink('//evil.com')).toBe(false);
    });

    it('rejects other schemes', () => {
      expect(isValidDeepLink('tel:+1234567890')).toBe(false);
      expect(isValidDeepLink('mailto:evil@example.com')).toBe(false);
      expect(isValidDeepLink('javascript:alert(1)')).toBe(false);
      expect(isValidDeepLink('file:///etc/passwd')).toBe(false);
      expect(isValidDeepLink('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidDeepLink('ftp://evil.com/file')).toBe(false);
    });

    it('rejects non-whitelisted routes', () => {
      expect(isValidDeepLink('/admin')).toBe(false);
      expect(isValidDeepLink('/api/users')).toBe(false);
      expect(isValidDeepLink('dreamseeker://admin')).toBe(false);
      expect(isValidDeepLink('/settings')).toBe(false);
      expect(isValidDeepLink('/debug')).toBe(false);
    });

    it('rejects path traversal attacks', () => {
      expect(isValidDeepLink('/dream/../admin')).toBe(false);
      expect(isValidDeepLink('/today/../../etc/passwd')).toBe(false);
      expect(isValidDeepLink('/dream/..%2F..%2Fadmin')).toBe(false);
      expect(isValidDeepLink('dreamseeker://dream/../admin')).toBe(false);
    });

    it('rejects invalid values', () => {
      expect(isValidDeepLink('')).toBe(false);
      expect(isValidDeepLink(null as unknown as string)).toBe(false);
      expect(isValidDeepLink(undefined as unknown as string)).toBe(false);
      expect(isValidDeepLink(123 as unknown as string)).toBe(false);
      expect(isValidDeepLink({} as unknown as string)).toBe(false);
    });

    it('rejects bare strings without leading slash', () => {
      expect(isValidDeepLink('today')).toBe(false);
      expect(isValidDeepLink('dream')).toBe(false);
      expect(isValidDeepLink('dashboard')).toBe(false);
    });

    it('rejects wrong app schemes', () => {
      expect(isValidDeepLink('otherscheme://today')).toBe(false);
      expect(isValidDeepLink('Dreamseeker://today')).toBe(false); // case sensitive
      expect(isValidDeepLink('DREAMSEEKER://today')).toBe(false);
    });

    it('rejects paths that only partially match allowed routes', () => {
      // '/dream-completer' should not match '/dream-complete'
      // but '/dream-complete/id' should match (subroute)
      expect(isValidDeepLink('/todayx')).toBe(false);
      expect(isValidDeepLink('/dashboardx')).toBe(false);
    });
  });

  // ── Allowed paths completeness ────────────────────────────────────────

  describe('Allowed paths', () => {
    it('includes all expected app routes', () => {
      const expectedPaths = [
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
      ];

      for (const path of expectedPaths) {
        expect(ALLOWED_DEEP_LINK_PATHS).toContain(path);
      }
    });

    it('does not include auth routes (should not deep link to sign-in)', () => {
      expect(ALLOWED_DEEP_LINK_PATHS).not.toContain('/sign-in');
      expect(ALLOWED_DEEP_LINK_PATHS).not.toContain('/sign-up');
    });
  });
});
