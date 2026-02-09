import { mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { authComponent } from './auth';
import { components } from './_generated/api';
import type { Id } from './_generated/dataModel';

/** Tables that have a `by_user` index on `userId`. */
type UserIndexedTable =
  | 'challengeCompletions'
  | 'checkIns'
  | 'journalEntries'
  | 'focusSessions'
  | 'userBadges'
  | 'uploadRateLimit'
  | 'pushNotificationRateLimit';

/** Delete all rows in `table` where `by_user` index matches `userId`. */
async function deleteAllByUser(ctx: MutationCtx, table: UserIndexedTable, userId: string) {
  const rows = await ctx.db
    .query(table)
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .collect();
  await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
}

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error('Unauthorized');

    const userId = user._id;

    // Delete all dreams and their actions (parallelized)
    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    await Promise.all(
      dreams.map(async (dream) => {
        const actions = await ctx.db
          .query('actions')
          .withIndex('by_dream', (q) => q.eq('dreamId', dream._id))
          .collect();
        await Promise.all(actions.map((a) => ctx.db.delete(a._id)));
        await ctx.db.delete(dream._id);
      })
    );

    // Delete user progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    if (progress) await ctx.db.delete(progress._id);

    // Delete user data from tables with by_user index
    await deleteAllByUser(ctx, 'challengeCompletions', userId);
    await deleteAllByUser(ctx, 'checkIns', userId);
    await deleteAllByUser(ctx, 'journalEntries', userId);
    await deleteAllByUser(ctx, 'focusSessions', userId);
    await deleteAllByUser(ctx, 'userBadges', userId);
    await deleteAllByUser(ctx, 'uploadRateLimit', userId);
    await deleteAllByUser(ctx, 'pushNotificationRateLimit', userId);

    // Delete user preferences
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    if (prefs) await ctx.db.delete(prefs._id);

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

const deleteAllByField = async (ctx: MutationCtx, model: string, field: string, value: string) => {
  let cursor: string | null = null;
  let isDone = false;
  // Type assertion required: Better Auth's adapter.deleteMany expects a narrow literal
  // union type for model/field (e.g. 'user' | 'session'), but we call this helper
  // dynamically with runtime strings. The assertion is safe because Better Auth only
  // uses these values as DB table/field lookups at runtime.
  const input = { model, where: [{ field, value }] } as { model: 'user'; where: [{ field: '_id'; value: string }] };
  while (!isDone) {
    const result: { isDone: boolean; continueCursor: string } = await ctx.runMutation(
      components.betterAuth.adapter.deleteMany,
      { input, paginationOpts: { numItems: 100, cursor } }
    );
    isDone = result.isDone;
    cursor = result.continueCursor;
  }
};
