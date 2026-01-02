import { cronJobs } from 'convex/server';
import { components, internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

// Clean up old email records from the Resend component
// Runs every hour to prevent accumulation
crons.interval(
  'Remove old emails from the resend component',
  { hours: 1 },
  internal.crons.cleanupResend,
);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clean up finalized emails (delivered, cancelled, bounced) older than 7 days
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    // Clean up abandoned emails (stuck in queue) older than 4 weeks
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, {
      olderThan: 4 * ONE_WEEK_MS,
    });
  },
});

export default crons;
