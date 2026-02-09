import { query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './helpers';
import { getTodayString, dateToDailyIndex } from './dates';

// Get a random mindset moment
export const getRandom = query({
  args: { category: v.optional(v.string()), timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let quotes;

    if (args.category) {
      quotes = await ctx.db
        .query('mindsetMoments')
        .withIndex('by_category', (q) => q.eq('category', args.category))
        .collect();
    } else {
      quotes = await ctx.db.query('mindsetMoments').collect();
    }

    if (quotes.length === 0) return null;

    // Use the current date to get a consistent quote for the day
    const today = getTodayString(args.timezone);
    return quotes[dateToDailyIndex(today, quotes.length)];
  },
});

// Get all mindset moments
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.category) {
      return await ctx.db
        .query('mindsetMoments')
        .withIndex('by_category', (q) => q.eq('category', args.category))
        .take(100);
    }
    return await ctx.db.query('mindsetMoments').take(100);
  },
});
