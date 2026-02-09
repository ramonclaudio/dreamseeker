import { cronJobs } from 'convex/server';
import { components, internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

crons.interval('Remove old emails from the resend component', { hours: 1 }, internal.crons.cleanupResend);
crons.interval('Check push notification receipts', { minutes: 15 }, internal.notificationsReceipts.checkPushReceipts);
crons.interval('Clean up old push receipts', { hours: 24 }, internal.notificationsReceipts.cleanupOldReceipts);
crons.interval('Clean up stale push tokens', { hours: 24 }, internal.notificationsTokens.cleanupStaleTokens);
crons.interval('Clean up old rate limit records', { hours: 24 }, internal.crons.cleanupRateLimits);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, { olderThan: ONE_WEEK_MS });
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, { olderThan: 4 * ONE_WEEK_MS });
  },
});

export const cleanupRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ONE_HOUR_MS;

    const oldUploadRecords = await ctx.db
      .query('uploadRateLimit')
      .filter((q) => q.lt(q.field('createdAt'), cutoff))
      .collect();
    await Promise.all(oldUploadRecords.map((r) => ctx.db.delete(r._id)));

    const oldPushRecords = await ctx.db
      .query('pushNotificationRateLimit')
      .filter((q) => q.lt(q.field('createdAt'), cutoff))
      .collect();
    await Promise.all(oldPushRecords.map((r) => ctx.db.delete(r._id)));
  },
});

export default crons;
