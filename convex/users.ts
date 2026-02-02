import { mutation } from './_generated/server';
import { authComponent } from './auth';
import { components } from './_generated/api';
import type { Id } from './_generated/dataModel';

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error('Unauthorized');

    const userId = user._id;

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    for (const task of tasks) await ctx.db.delete("tasks", task._id);

    const pushTokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    for (const token of pushTokens) {
      const receipts = await ctx.db
        .query('pushReceipts')
        .withIndex('by_token', (q) => q.eq('token', token.token))
        .collect();
      for (const receipt of receipts) await ctx.db.delete(receipt._id);
      await ctx.db.delete(token._id);
    }

    if (user.image && !user.image.includes('/') && !user.image.startsWith('http')) {
      try { await ctx.storage.delete(user.image as Id<'_storage'>); } catch (error) {
        console.error('[User] Failed to delete avatar storage:', error instanceof Error ? error.message : error);
      }
    }

    await deleteAllByField(ctx, 'session', 'userId', userId);
    await deleteAllByField(ctx, 'account', 'userId', userId);
    if (user.email) await deleteAllByField(ctx, 'verification', 'identifier', user.email);
    await deleteAllByField(ctx, 'twoFactor', 'userId', userId);
    await deleteAllByField(ctx, 'passkey', 'userId', userId);
    await deleteAllByField(ctx, 'oauthAccessToken', 'userId', userId);
    await deleteAllByField(ctx, 'oauthConsent', 'userId', userId);
    await deleteAllByField(ctx, 'oauthApplication', 'userId', userId);

    await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: { model: 'user', where: [{ field: '_id', value: userId }] },
    });

    return { success: true };
  },
});

const deleteAllByField = async (ctx: any, model: string, field: string, value: string) => {
  let cursor: string | null = null;
  let isDone = false;
  while (!isDone) {
    const result: { isDone: boolean; continueCursor: string } = await ctx.runMutation(
      components.betterAuth.adapter.deleteMany,
      { input: { model, where: [{ field, value }] }, paginationOpts: { numItems: 100, cursor } }
    );
    isDone = result.isDone;
    cursor = result.continueCursor;
  }
};
