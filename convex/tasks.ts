import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { authComponent } from './auth';
import { TIERS, PREMIUM_ENTITLEMENT } from './subscriptions';
import { hasEntitlement } from './revenuecat';

const MAX_TASK_TEXT_LENGTH = 500;

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
    return await ctx.db.query('tasks').withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true)).order('desc').collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const trimmedText = args.text.trim();
    if (trimmedText.length === 0) throw new Error('Task text cannot be empty');
    if (trimmedText.length > MAX_TASK_TEXT_LENGTH) throw new Error(`Task text cannot exceed ${MAX_TASK_TEXT_LENGTH} characters`);

    // Check tier limits - O(limit) instead of O(n)
    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    if (!isPremium) {
      const limit = TIERS.free.limit;
      const tasks = await ctx.db
        .query('tasks')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .take(limit);
      if (tasks.length >= limit) {
        throw new Error('LIMIT_REACHED');
      }
    }

    return await ctx.db.insert('tasks', { userId, text: trimmedText, isCompleted: false, createdAt: Date.now() });
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
