import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { authComponent } from './auth';

async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const user = await authComponent.safeGetAuthUser(ctx);
  // Use _id (the auth user's ID), not userId (which requires a separate users table)
  return user?._id ?? null;
}

async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function getOwnedTask(ctx: MutationCtx, id: Id<'tasks'>, userId: string) {
  const task = await ctx.db.get(id);
  if (!task) throw new Error('Task not found');
  if (task.userId !== userId) throw new Error('Forbidden');
  return task;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Use safe auth check - return empty array if not authenticated yet
    // This prevents errors during the brief window when client thinks it's
    // authenticated but server session isn't fully synced
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return await ctx.db.insert('tasks', {
      userId,
      text: args.text,
      isCompleted: false,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const task = await getOwnedTask(ctx, args.id, userId);
    await ctx.db.patch(args.id, { isCompleted: !task.isCompleted });
  },
});

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const task = await ctx.db.get(args.id);
    // Idempotent: silently succeed if task already deleted
    if (!task) return;
    if (task.userId !== userId) throw new Error('Forbidden');
    await ctx.db.delete(args.id);
  },
});
