/**
 * URL validation and display text sanitization tests.
 *
 * Covers validateUrl (SSRF prevention), sanitizeDisplayText (XSS/injection),
 * and validateFocusDuration — all added with the community/boards feature.
 */

import {
  validateUrl,
  sanitizeDisplayText,
  validateFocusDuration,
  MIN_FOCUS_DURATION,
  MAX_FOCUS_DURATION,
} from '../convex/validation';

// ── validateUrl ─────────────────────────────────────────────────────────────

describe('validateUrl', () => {
  it('accepts https URLs', () => {
    expect(() => validateUrl('https://example.com', 'Link')).not.toThrow();
    expect(() => validateUrl('https://unsplash.com/photos/abc', 'Link')).not.toThrow();
  });

  it('accepts http URLs', () => {
    expect(() => validateUrl('http://example.com', 'Link')).not.toThrow();
  });

  it('rejects javascript: scheme (XSS)', () => {
    expect(() => validateUrl('javascript:alert(1)', 'Link')).toThrow('must use http or https');
  });

  it('rejects data: scheme', () => {
    expect(() => validateUrl('data:text/html,<h1>hi</h1>', 'Link')).toThrow('must use http or https');
  });

  it('rejects ftp: scheme', () => {
    expect(() => validateUrl('ftp://files.example.com/doc', 'Link')).toThrow('must use http or https');
  });

  it('rejects file: scheme (SSRF)', () => {
    expect(() => validateUrl('file:///etc/passwd', 'Link')).toThrow('must use http or https');
  });

  it('rejects malformed URLs', () => {
    expect(() => validateUrl('not-a-url', 'Link')).toThrow('is not a valid URL');
    expect(() => validateUrl('', 'Link')).toThrow('is not a valid URL');
  });

  it('includes field name in error messages', () => {
    expect(() => validateUrl('ftp://x', 'Pin URL')).toThrow('Pin URL must use');
    expect(() => validateUrl('bad', 'Pin URL')).toThrow('Pin URL is not');
  });

  it('accepts URLs with paths, query params, and fragments', () => {
    expect(() =>
      validateUrl('https://example.com/path?q=1&x=2#section', 'Link')
    ).not.toThrow();
  });

  it('accepts URLs with ports', () => {
    expect(() => validateUrl('https://localhost:3000/api', 'Link')).not.toThrow();
  });
});

// ── sanitizeDisplayText ─────────────────────────────────────────────────────

describe('sanitizeDisplayText', () => {
  it('preserves normal text', () => {
    expect(sanitizeDisplayText('Hello world')).toBe('Hello world');
  });

  it('preserves newlines and tabs (allowed whitespace)', () => {
    expect(sanitizeDisplayText('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  it('strips null bytes', () => {
    expect(sanitizeDisplayText('hello\x00world')).toBe('helloworld');
  });

  it('strips control characters (\\x01-\\x08)', () => {
    expect(sanitizeDisplayText('a\x01b\x02c\x08d')).toBe('abcd');
  });

  it('strips vertical tab and form feed (\\x0B, \\x0C)', () => {
    expect(sanitizeDisplayText('a\x0Bb\x0Cc')).toBe('abc');
  });

  it('strips DEL character (\\x7F)', () => {
    expect(sanitizeDisplayText('test\x7Fvalue')).toBe('testvalue');
  });

  it('strips zero-width characters', () => {
    expect(sanitizeDisplayText('he\u200Bllo')).toBe('hello'); // zero-width space
    expect(sanitizeDisplayText('he\uFEFFllo')).toBe('hello'); // byte order mark
  });

  it('strips line/paragraph separators (\\u2028, \\u2029)', () => {
    expect(sanitizeDisplayText('a\u2028b\u2029c')).toBe('abc');
  });

  it('preserves emoji and unicode text', () => {
    expect(sanitizeDisplayText('Dream big 🌟')).toBe('Dream big 🌟');
    expect(sanitizeDisplayText('café résumé')).toBe('café résumé');
  });

  it('handles empty string', () => {
    expect(sanitizeDisplayText('')).toBe('');
  });
});

// ── validateFocusDuration ───────────────────────────────────────────────────

describe('validateFocusDuration', () => {
  it('exports correct min/max constants', () => {
    expect(MIN_FOCUS_DURATION).toBe(1);
    expect(MAX_FOCUS_DURATION).toBe(28800); // 8 hours
  });

  it('accepts minimum duration (1 second)', () => {
    expect(validateFocusDuration(1)).toEqual({ valid: true });
  });

  it('accepts maximum duration (8 hours)', () => {
    expect(validateFocusDuration(28800)).toEqual({ valid: true });
  });

  it('accepts typical durations', () => {
    expect(validateFocusDuration(300).valid).toBe(true); // 5 min
    expect(validateFocusDuration(1500).valid).toBe(true); // 25 min (pomodoro)
    expect(validateFocusDuration(3600).valid).toBe(true); // 1 hour
  });

  it('rejects zero seconds', () => {
    const result = validateFocusDuration(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 1 second');
  });

  it('rejects negative seconds', () => {
    const result = validateFocusDuration(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects durations exceeding 8 hours', () => {
    const result = validateFocusDuration(28801);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('8 hours');
  });
});
