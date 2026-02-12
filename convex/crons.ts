import { cronJobs } from 'convex/server';
import { components, internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

crons.interval('Remove old emails from the resend component', { hours: 1 }, internal.crons.cleanupResend);
crons.interval('Check push notification receipts', { minutes: 15 }, internal.notificationsReceipts.checkPushReceipts);
crons.interval('Clean up old push receipts', { hours: 24 }, internal.notificationsReceipts.cleanupOldReceipts);
crons.interval('Check action reminders and notify', { minutes: 15 }, internal.deadlines.checkReminders);
crons.interval('Clean up stale push tokens', { hours: 24 }, internal.notificationsTokens.cleanupStaleTokens);
crons.interval('Clean up old rate limit records', { hours: 24 }, internal.crons.cleanupRateLimits);
crons.interval('Prune old feed events', { hours: 24 }, internal.crons.pruneFeedEvents);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, { olderThan: ONE_WEEK_MS });
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, { olderThan: 4 * ONE_WEEK_MS });
  },
});

const CLEANUP_BATCH_SIZE = 500;

/** Delete up to CLEANUP_BATCH_SIZE expired rows from a rate-limit table. Reschedules if more remain. */
async function cleanupRateLimitTable(
  ctx: { db: import('./_generated/server').MutationCtx['db']; scheduler: import('./_generated/server').MutationCtx['scheduler'] },
  table: 'uploadRateLimit' | 'pushNotificationRateLimit' | 'communityRateLimit',
  cutoff: number,
) {
  const batch = await ctx.db.query(table).take(CLEANUP_BATCH_SIZE);
  const expired = batch.filter((r) => r.createdAt < cutoff);
  await Promise.all(expired.map((r) => ctx.db.delete(r._id)));
  // If the batch was full, there may be more — reschedule
  if (batch.length === CLEANUP_BATCH_SIZE) {
    await ctx.scheduler.runAfter(0, internal.crons.cleanupRateLimits);
  }
}

export const cleanupRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ONE_HOUR_MS;
    await cleanupRateLimitTable(ctx, 'uploadRateLimit', cutoff);
    await cleanupRateLimitTable(ctx, 'pushNotificationRateLimit', cutoff);
    await cleanupRateLimitTable(ctx, 'communityRateLimit', cutoff);
  },
});

export const pruneFeedEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - NINETY_DAYS_MS;

    // Process in bounded batches to avoid OOM
    const batch = await ctx.db
      .query('activityFeed')
      .take(CLEANUP_BATCH_SIZE);
    const expired = batch.filter((e) => e.createdAt < cutoff);

    await Promise.all(expired.map((event) => ctx.db.delete(event._id)));

    // Reschedule if batch was full (more may remain)
    if (batch.length === CLEANUP_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.crons.pruneFeedEvents);
    }
  },
});

export default crons;
