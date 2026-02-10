import type { MutationCtx } from './_generated/server';
import type { FeedEventType, FeedMetadata } from './constants';

// ── Feed Event Helper ───────────────────────────────────────────────────────

export async function createFeedEvent(
  ctx: MutationCtx,
  userId: string,
  type: FeedEventType,
  referenceId?: string,
  metadata?: FeedMetadata
) {
  await ctx.db.insert('activityFeed', {
    userId,
    type,
    referenceId,
    metadata,
    createdAt: Date.now(),
  });
}
