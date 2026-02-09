import { authQuery, authMutation } from './functions';
import { v } from 'convex/values';
import { hiddenItemTypeValidator } from './constants';

// ── Mutations ───────────────────────────────────────────────────────────────

export const hideItem = authMutation({
  args: {
    itemType: hiddenItemTypeValidator,
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user_item', (q) => q.eq('userId', ctx.user).eq('itemId', args.itemId))
      .first();

    if (existing) return;

    await ctx.db.insert('hiddenItems', {
      userId: ctx.user,
      itemType: args.itemType,
      itemId: args.itemId,
      createdAt: Date.now(),
    });
  },
});

export const unhideItem = authMutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const hidden = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user_item', (q) => q.eq('userId', ctx.user).eq('itemId', args.itemId))
      .first();

    if (hidden) {
      await ctx.db.delete(hidden._id);
    }
  },
});

// ── Category Hiding ─────────────────────────────────────────────────────────

export const hideCategory = authMutation({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    if (args.category.length > 50) throw new Error('Category name too long');

    const itemId = `category:${args.category}`;

    const existing = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user_item', (q) => q.eq('userId', ctx.user).eq('itemId', itemId))
      .first();

    if (existing) return;

    await ctx.db.insert('hiddenItems', {
      userId: ctx.user,
      itemType: 'dream',
      itemId,
      createdAt: Date.now(),
    });
  },
});

export const unhideCategory = authMutation({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    if (args.category.length > 50) throw new Error('Category name too long');

    const itemId = `category:${args.category}`;

    const hidden = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user_item', (q) => q.eq('userId', ctx.user).eq('itemId', itemId))
      .first();

    if (hidden) {
      await ctx.db.delete(hidden._id);
    }
  },
});

export const listHiddenCategories = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const items = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .collect();

    return items
      .filter((i) => i.itemId.startsWith('category:'))
      .map((i) => i.itemId.replace('category:', ''));
  },
});

// ── Queries ─────────────────────────────────────────────────────────────────

export const listHiddenItems = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    return await ctx.db
      .query('hiddenItems')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .collect();
  },
});

export const isHidden = authQuery({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return false;

    const hidden = await ctx.db
      .query('hiddenItems')
      .withIndex('by_user_item', (q) => q.eq('userId', ctx.user!).eq('itemId', args.itemId))
      .first();

    return hidden !== null;
  },
});
