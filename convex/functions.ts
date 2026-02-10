import { customQuery, customMutation } from 'convex-helpers/server/customFunctions';
import { wrapDatabaseReader, wrapDatabaseWriter } from 'convex-helpers/server/rowLevelSecurity';
import { query, mutation } from './_generated/server';
import { authComponent } from './auth';
import { rules, type RLSCtx } from './security';

/**
 * Authenticated query wrapper.
 *
 * - `ctx.user`: user ID (string | null). Queries return empty when null.
 * - `ctx.db`: RLS-wrapped reader (only sees rows matching security rules).
 * - `ctx.unsafeDb`: raw unwrapped reader — any use is a red flag in review.
 */
export const authQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?._id ?? null;
    const rlsCtx: RLSCtx = { user: userId ?? '' };
    return {
      ctx: {
        user: userId,
        db: wrapDatabaseReader(rlsCtx, ctx.db, rules, { defaultPolicy: 'deny' }),
        unsafeDb: ctx.db,
      },
      args: {},
    };
  },
});

/**
 * Authenticated mutation wrapper.
 *
 * - `ctx.user`: user ID (string). Throws if not authenticated.
 * - `ctx.db`: RLS-wrapped writer (only sees/writes rows matching security rules).
 * - `ctx.unsafeDb`: raw unwrapped writer — any use is a red flag in review.
 */
export const authMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new Error('Unauthorized');
    const userId = authUser._id;
    const rlsCtx: RLSCtx = { user: userId };
    return {
      ctx: {
        user: userId,
        db: wrapDatabaseWriter(rlsCtx, ctx.db, rules, { defaultPolicy: 'deny' }),
        unsafeDb: ctx.db,
      },
      args: {},
    };
  },
});

