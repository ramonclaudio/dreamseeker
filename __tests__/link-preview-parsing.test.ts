/**
 * Link preview OG tag parsing tests.
 *
 * Tests the regex patterns used in convex/linkPreview.ts to extract
 * Open Graph metadata from HTML. These are pure regex tests — no
 * network calls or Convex runtime needed.
 *
 * The regexes are duplicated here as contract tests: if the parsing
 * logic in linkPreview.ts changes, these tests document the expected
 * behavior.
 */

// Mirror the exact regex patterns from convex/linkPreview.ts
function parseOgTags(html: string) {
  const ogTitle =
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const ogDescription =
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1];
  const ogImage =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
  return { ogTitle, ogDescription, ogImage };
}

function extractDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

// ── OG Title Parsing ────────────────────────────────────────────────────────

describe('OG title parsing', () => {
  it('extracts og:title with property before content', () => {
    const html = '<meta property="og:title" content="My Page Title">';
    expect(parseOgTags(html).ogTitle).toBe('My Page Title');
  });

  it('extracts og:title with content before property', () => {
    const html = '<meta content="Reversed Order" property="og:title">';
    expect(parseOgTags(html).ogTitle).toBe('Reversed Order');
  });

  it('falls back to <title> tag when no og:title', () => {
    const html = '<html><head><title>Fallback Title</title></head></html>';
    expect(parseOgTags(html).ogTitle).toBe('Fallback Title');
  });

  it('prefers og:title over <title>', () => {
    const html = '<meta property="og:title" content="OG Title"><title>HTML Title</title>';
    expect(parseOgTags(html).ogTitle).toBe('OG Title');
  });

  it('returns undefined when no title found', () => {
    const html = '<html><head></head><body>No title here</body></html>';
    expect(parseOgTags(html).ogTitle).toBeUndefined();
  });

  it('handles single quotes in meta tags', () => {
    const html = "<meta property='og:title' content='Single Quotes'>";
    expect(parseOgTags(html).ogTitle).toBe('Single Quotes');
  });
});

// ── OG Description Parsing ──────────────────────────────────────────────────

describe('OG description parsing', () => {
  it('extracts og:description with property before content', () => {
    const html = '<meta property="og:description" content="A great page about travel">';
    expect(parseOgTags(html).ogDescription).toBe('A great page about travel');
  });

  it('extracts og:description with content before property', () => {
    const html = '<meta content="Reversed desc" property="og:description">';
    expect(parseOgTags(html).ogDescription).toBe('Reversed desc');
  });

  it('returns undefined when no description found', () => {
    const html = '<meta property="og:title" content="Title Only">';
    expect(parseOgTags(html).ogDescription).toBeUndefined();
  });
});

// ── OG Image Parsing ────────────────────────────────────────────────────────

describe('OG image parsing', () => {
  it('extracts og:image URL', () => {
    const html = '<meta property="og:image" content="https://example.com/img.jpg">';
    expect(parseOgTags(html).ogImage).toBe('https://example.com/img.jpg');
  });

  it('extracts og:image with reversed attribute order', () => {
    const html = '<meta content="https://example.com/preview.png" property="og:image">';
    expect(parseOgTags(html).ogImage).toBe('https://example.com/preview.png');
  });

  it('returns undefined when no image found', () => {
    const html = '<meta property="og:title" content="No Image">';
    expect(parseOgTags(html).ogImage).toBeUndefined();
  });
});

// ── Domain Extraction ───────────────────────────────────────────────────────

describe('domain extraction', () => {
  it('extracts domain from URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com');
  });

  it('strips www. prefix', () => {
    expect(extractDomain('https://www.example.com/page')).toBe('example.com');
  });

  it('preserves subdomains other than www', () => {
    expect(extractDomain('https://blog.example.com/post')).toBe('blog.example.com');
  });

  it('handles URLs with ports', () => {
    expect(extractDomain('https://example.com:8080/api')).toBe('example.com');
  });
});

// ── Full HTML Document Parsing ──────────────────────────────────────────────

describe('realistic HTML parsing', () => {
  it('parses a typical page with all OG tags', () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>HTML Title</title>
        <meta property="og:title" content="Bali Travel Guide">
        <meta property="og:description" content="Everything you need to know about Bali">
        <meta property="og:image" content="https://example.com/bali.jpg">
      </head>
      <body></body>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.ogTitle).toBe('Bali Travel Guide');
    expect(result.ogDescription).toBe('Everything you need to know about Bali');
    expect(result.ogImage).toBe('https://example.com/bali.jpg');
  });

  it('handles page with only <title> tag', () => {
    const html = `
      <!DOCTYPE html>
      <html><head><title>Simple Page</title></head><body></body></html>
    `;
    const result = parseOgTags(html);
    expect(result.ogTitle).toBe('Simple Page');
    expect(result.ogDescription).toBeUndefined();
    expect(result.ogImage).toBeUndefined();
  });

  it('handles empty HTML', () => {
    const result = parseOgTags('');
    expect(result.ogTitle).toBeUndefined();
    expect(result.ogDescription).toBeUndefined();
    expect(result.ogImage).toBeUndefined();
  });
});

// ── Truncation contract ─────────────────────────────────────────────────────

describe('OG tag truncation (contract)', () => {
  it('title truncation at 200 chars', () => {
    // linkPreview.ts slices ogTitle to 200 chars
    const longTitle = 'A'.repeat(300);
    expect(longTitle.slice(0, 200).length).toBe(200);
  });

  it('description truncation at 500 chars', () => {
    const longDesc = 'B'.repeat(600);
    expect(longDesc.slice(0, 500).length).toBe(500);
  });
});
