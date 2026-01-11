import { mutation, action, query, internalQuery, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { authComponent } from './auth';

const getAuthUserId = async (ctx: MutationCtx) => (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

export const savePushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const now = Date.now();

    if (existing) {
      if (existing.token !== args.token || existing.platform !== args.platform) {
        await ctx.db.patch('pushTokens', existing._id, {
          token: args.token,
          platform: args.platform,
          updatedAt: now,
        });
      }
    } else {
      await ctx.db.insert('pushTokens', {
        userId,
        token: args.token,
        platform: args.platform,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const removePushToken = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.delete('pushTokens', existing._id);
    }
  },
});

export const getPushToken = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
    return doc?.token ?? null;
  },
});

export const sendPushNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; error?: string; result?: unknown }> => {
    const token: string | null = await ctx.runQuery(internal.notifications.getPushToken, { userId: args.userId });
    if (!token) return { success: false, error: 'No push token' };

    const response: Response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: args.title,
        body: args.body,
        data: args.data,
        sound: 'default',
        priority: 'high',
      }),
    });

    const result: unknown = await response.json();
    return { success: response.ok, result };
  },
});
