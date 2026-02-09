/**
 * Email template tests.
 *
 * The escapeHtml function is a critical XSS prevention boundary.
 * emailTemplates.ts has no Convex imports — directly testable.
 */
import { resetPasswordTemplate, otpVerificationTemplate } from '../convex/emailTemplates';

// ── escapeHtml (tested indirectly through templates) ────────────────────────

// The escapeHtml function is not exported, so we test it through the templates.
// If a URL or OTP containing special chars comes through unescaped, the template
// output would contain raw HTML — which is an XSS vector in email clients.

describe('resetPasswordTemplate', () => {
  it('returns HTML string containing the URL', () => {
    const html = resetPasswordTemplate('https://example.com/reset?token=abc');
    expect(html).toContain('https://example.com/reset?token=abc');
  });

  it('contains the reset password heading', () => {
    const html = resetPasswordTemplate('https://example.com');
    expect(html).toContain('Reset your password');
  });

  it('contains a clickable link', () => {
    const html = resetPasswordTemplate('https://example.com/reset');
    expect(html).toContain('href="https://example.com/reset"');
  });

  it('escapes HTML entities in the URL', () => {
    const maliciousUrl = 'https://evil.com/reset?token=<script>alert("xss")</script>';
    const html = resetPasswordTemplate(maliciousUrl);
    // Should NOT contain raw < or > from the URL
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('</script>');
    // Should contain escaped versions
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes double quotes in URL to prevent attribute injection', () => {
    const url = 'https://evil.com/reset?token="onmouseover="alert(1)';
    const html = resetPasswordTemplate(url);
    // The raw " should be escaped to &quot; so the href attribute is closed properly
    expect(html).toContain('&quot;');
    // The href should NOT contain an unescaped double quote that would break out
    expect(html).not.toContain('href="https://evil.com/reset?token="');
  });

  it('escapes ampersands in URL', () => {
    const url = 'https://example.com/reset?a=1&b=2';
    const html = resetPasswordTemplate(url);
    // Ampersands in the URL should be escaped
    expect(html).toContain('&amp;b=2');
  });

  it('escapes single quotes', () => {
    const url = "https://evil.com/reset?token='><img src=x onerror=alert(1)>";
    const html = resetPasswordTemplate(url);
    expect(html).not.toContain("'><img");
    expect(html).toContain('&#39;');
  });

  it('mentions expiration time', () => {
    const html = resetPasswordTemplate('https://example.com');
    expect(html).toContain('expire');
  });

  it('includes fallback copy link', () => {
    const url = 'https://example.com/reset?token=abc123';
    const html = resetPasswordTemplate(url);
    // Should have a plaintext copy of the URL
    expect(html).toContain('copy this link');
  });
});

describe('otpVerificationTemplate', () => {
  it('returns HTML string containing the OTP', () => {
    const html = otpVerificationTemplate('123456');
    expect(html).toContain('123456');
  });

  it('contains verification heading', () => {
    const html = otpVerificationTemplate('123456');
    expect(html).toContain('Verify your email');
  });

  it('escapes HTML in OTP value', () => {
    const maliciousOtp = '<script>alert("xss")</script>';
    const html = otpVerificationTemplate(maliciousOtp);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('mentions expiration', () => {
    const html = otpVerificationTemplate('123456');
    expect(html).toContain('expires');
  });

  it('uses monospace font for OTP display', () => {
    const html = otpVerificationTemplate('123456');
    expect(html).toContain('monospace');
  });
});
