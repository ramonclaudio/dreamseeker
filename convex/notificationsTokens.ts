import { mutation, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { requireAuth } from './helpers';
import { validatePushToken } from './validation';

export type PushToken = {
  _id: string;
  token: string;
  platform: 'ios' | 'android';
  userId: string;
  deviceId?: string;
  lastUsed: number;
  createdAt: number;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const savePushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    validatePushToken(args.token);

    const now = Date.now();

    const existingByToken = await ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (existingByToken) {
      if (existingByToken.userId !== userId) {
        await ctx.db.delete(existingByToken._id);
        await ctx.db.insert('pushTokens', {
          userId,
          token: args.token,
          platform: args.platform,
          deviceId: args.deviceId,
          lastUsed: now,
          createdAt: now,
        });
      } else {
        await ctx.db.patch(existingByToken._id, {
          platform: args.platform,
          deviceId: args.deviceId,
          lastUsed: now,
        });
      }
      return;
    }

    // Cap tokens per user to prevent flooding (max 10 devices)
    const userTokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    if (userTokens.length >= 10) {
      const oldest = userTokens.sort((a, b) => a.createdAt - b.createdAt)[0];
      await ctx.db.delete(oldest._id);
    }

    await ctx.db.insert('pushTokens', {
      userId,
      token: args.token,
      platform: args.platform,
      deviceId: args.deviceId,
      lastUsed: now,
      createdAt: now,
    });
  },
});

export const removePushToken = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    if (args.token) {
      const tokenValue = args.token;
      const existing = await ctx.db
        .query('pushTokens')
        .withIndex('by_token', (q) => q.eq('token', tokenValue))
        .first();
      if (existing && existing.userId === userId) {
        await ctx.db.delete(existing._id);
      }
    } else {
      const tokens = await ctx.db
        .query('pushTokens')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
      for (const token of tokens) {
        await ctx.db.delete(token._id);
      }
    }
  },
});

export const getUserTokens = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<PushToken[]> => {
    const tokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return tokens as PushToken[];
  },
});

export const getTokenByValue = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
  },
});

export const deleteTokenByValue = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const cleanupStaleTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    const allTokens = await ctx.db
      .query('pushTokens')
      .collect();
    const staleTokens = allTokens.filter((t) => t.lastUsed < cutoff);
    for (const token of staleTokens) {
      await ctx.db.delete(token._id);
    }
    return staleTokens.length;
  },
});
