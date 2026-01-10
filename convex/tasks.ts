import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { authComponent } from './auth';
import { components } from './_generated/api';
import { type TierKey, TIER_LIMITS } from './schema/tiers';
import { getTierFromPriceId } from './subscriptions';

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) => (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

const getOwnedTask = async (ctx: MutationCtx, id: Id<'tasks'>, userId: string) => {
  const task = await ctx.db.get("tasks", id);
  if (!task) throw new Error('Task not found');
  if (task.userId !== userId) throw new Error('Forbidden');
  return task;
};

const getUserTier = async (ctx: MutationCtx, userId: string): Promise<TierKey> => {
  const subscriptions = await ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, { userId });
  const active = subscriptions.find((sub) => sub.status === 'active' || sub.status === 'trialing');
  return getTierFromPriceId(active?.priceId);
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query('tasks').withIndex('by_user', (q) => q.eq('userId', userId)).order('desc').collect();
  },
});

export const listCompleted = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tasks = await ctx.db.query('tasks').withIndex('by_user', (q) => q.eq('userId', userId)).order('desc').collect();
    return tasks.filter((task) => task.isCompleted);
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const tierKey = await getUserTier(ctx, userId);
    const taskLimit = TIER_LIMITS[tierKey];

    if (taskLimit !== null) {
      const existing = await ctx.db.query('tasks').withIndex('by_user', (q) => q.eq('userId', userId)).collect();
      if (existing.length >= taskLimit) throw new Error('LIMIT_REACHED');
    }

    return await ctx.db.insert('tasks', { userId, text: args.text, isCompleted: false, createdAt: Date.now() });
  },
});

export const toggle = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const task = await getOwnedTask(ctx, args.id, userId);
    await ctx.db.patch("tasks", args.id, { isCompleted: !task.isCompleted });
  },
});

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const task = await ctx.db.get("tasks", args.id);
    if (!task) return; // Idempotent: already deleted
    if (task.userId !== userId) throw new Error('Forbidden');
    await ctx.db.delete("tasks", args.id);
  },
});
