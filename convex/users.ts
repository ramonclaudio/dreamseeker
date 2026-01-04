import { mutation } from './_generated/server';
import { authComponent } from './auth';
import { components } from './_generated/api';
import type { Id } from './_generated/dataModel';

/**
 * Delete the current user's account and all associated data.
 * This includes:
 * - All tasks
 * - Profile image from storage
 * - All sessions
 * - All accounts (credentials)
 * - All verification tokens
 * - The user record itself
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const userId = user._id;

    // 1. Delete all user's tasks from our schema
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // 2. Delete profile image from storage if it exists
    if (user.image && !user.image.includes('/') && !user.image.startsWith('http')) {
      try {
        await ctx.storage.delete(user.image as Id<'_storage'>);
      } catch {
        // Ignore storage deletion errors
      }
    }

    // 3. Delete all sessions for this user
    await deleteAllByField(ctx, 'session', 'userId', userId);

    // 4. Delete all accounts (credentials) for this user
    await deleteAllByField(ctx, 'account', 'userId', userId);

    // 5. Delete verification tokens for this user's email
    if (user.email) {
      await deleteAllByField(ctx, 'verification', 'identifier', user.email);
    }

    // 6. Delete two-factor data if exists
    await deleteAllByField(ctx, 'twoFactor', 'userId', userId);

    // 7. Delete passkeys if exist
    await deleteAllByField(ctx, 'passkey', 'userId', userId);

    // 8. Delete OAuth tokens if exist
    await deleteAllByField(ctx, 'oauthAccessToken', 'userId', userId);

    // 9. Delete OAuth consents if exist
    await deleteAllByField(ctx, 'oauthConsent', 'userId', userId);

    // 10. Finally, delete the user record
    await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: 'user',
        where: [{ field: '_id', value: userId }],
      },
    });

    return { success: true };
  },
});

/**
 * Helper to delete all records matching a field value using pagination
 */
async function deleteAllByField(
  ctx: any,
  model: string,
  field: string,
  value: string
) {
  let cursor: string | null = null;
  let isDone = false;

  while (!isDone) {
    const result: { isDone: boolean; continueCursor: string } = await ctx.runMutation(
      components.betterAuth.adapter.deleteMany,
      {
        input: {
          model,
          where: [{ field, value }],
        },
        paginationOpts: {
          numItems: 100,
          cursor,
        },
      }
    );

    isDone = result.isDone;
    cursor = result.continueCursor;
  }
}
