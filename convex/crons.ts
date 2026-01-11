import { cronJobs } from 'convex/server';
import { components, internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

crons.interval('Remove old emails from the resend component', { hours: 1 }, internal.crons.cleanupResend);
crons.interval('Check push notification receipts', { minutes: 15 }, internal.notifications.checkPushReceipts);
crons.interval('Clean up old push receipts', { hours: 24 }, internal.notifications.cleanupOldReceipts);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, { olderThan: ONE_WEEK_MS });
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, { olderThan: 4 * ONE_WEEK_MS });
  },
});

export default crons;
