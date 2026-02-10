import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

// ── Internal Query ───────────────────────────────────────────────────────────

export const getPinById = internalQuery({
  args: { pinId: v.id('pins') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pinId);
  },
});

// ── Link Preview Action ──────────────────────────────────────────────────────

export const fetchLinkPreview = internalAction({
  args: { pinId: v.id('pins') },
  handler: async (ctx, args) => {
    const pin = await ctx.runQuery(internal.linkPreview.getPinById, { pinId: args.pinId });
    if (!pin?.linkUrl) return;

    // Validate URL scheme to prevent SSRF
    try {
      const parsed = new URL(pin.linkUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
    } catch {
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(pin.linkUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'DreamSeeker/1.0 (Link Preview)' },
      });
      clearTimeout(timeout);

      if (!response.ok) return;

      const html = await response.text();

      // Parse og:tags via regex (no DOM parser in Convex actions)
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

      const domain = new URL(pin.linkUrl).hostname.replace(/^www\./, '');

      await ctx.runMutation(internal.linkPreview.updateLinkPreview, {
        pinId: args.pinId,
        linkTitle: ogTitle?.slice(0, 200),
        linkDescription: ogDescription?.slice(0, 500),
        linkImageUrl: ogImage,
        linkDomain: domain,
      });
    } catch (error) {
      console.error('[LinkPreview] Failed to fetch preview:', error instanceof Error ? error.message : error);
    }
  },
});

// ── Internal Mutation ────────────────────────────────────────────────────────

export const updateLinkPreview = internalMutation({
  args: {
    pinId: v.id('pins'),
    linkTitle: v.optional(v.string()),
    linkDescription: v.optional(v.string()),
    linkImageUrl: v.optional(v.string()),
    linkDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pin = await ctx.db.get(args.pinId);
    if (!pin) return;

    await ctx.db.patch(args.pinId, {
      linkTitle: args.linkTitle,
      linkDescription: args.linkDescription,
      linkImageUrl: args.linkImageUrl,
      linkDomain: args.linkDomain,
    });
  },
});
