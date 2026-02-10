import type { MutationCtx } from './_generated/server';
import { COMMUNITY_RATE_LIMITS } from './constants';
import type { CommunityAction } from './constants';

/**
 * Check + record a rate limit for a community action.
 * Throws if the user exceeded the allowed rate.
 */
export async function checkCommunityRateLimit(
  db: MutationCtx['db'],
  userId: string,
  action: CommunityAction,
) {
  const config = COMMUNITY_RATE_LIMITS[action];
  const cutoff = Date.now() - config.windowMs;

  // Use unsafeDb since communityRateLimit RLS restricts to own rows anyway
  const records = await db
    .query('communityRateLimit')
    .withIndex('by_user_action', (q) => q.eq('userId', userId).eq('action', action))
    .collect();

  const recent = records.filter((r) => r.createdAt >= cutoff);
  if (recent.length >= config.max) {
    throw new Error('Too many requests. Please try again later.');
  }

  await db.insert('communityRateLimit', {
    userId,
    action,
    createdAt: Date.now(),
  });
}
