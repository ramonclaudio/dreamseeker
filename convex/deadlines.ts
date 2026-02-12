import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';

/**
 * Cron-driven check: find pending actions whose user-set reminder time has
 * arrived (reminder <= now) that haven't been sent yet. One push per user.
 */
export const checkReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Full scan — fine at hackathon scale
    const allActions = await ctx.db.query('actions').collect();

    const due = allActions.filter(
      (a) =>
        !a.isCompleted &&
        a.status !== 'archived' &&
        a.reminder !== undefined &&
        a.reminder <= now &&
        a.reminderSentAt === undefined,
    );

    if (due.length === 0) return { checked: 0, users: 0 };

    // Fetch dreams for title context, filter out archived
    const dreamIds = [...new Set(due.map((a) => a.dreamId))];
    const dreams = await Promise.all(dreamIds.map((id) => ctx.db.get(id)));
    const dreamMap = new Map(
      dreams
        .filter((d): d is Doc<'dreams'> => d !== null && d.status !== 'archived')
        .map((d) => [d._id, d]),
    );

    const validActions = due.filter((a) => dreamMap.has(a.dreamId));

    // Group by user
    const byUser = new Map<string, typeof validActions>();
    for (const action of validActions) {
      const list = byUser.get(action.userId) ?? [];
      list.push(action);
      byUser.set(action.userId, list);
    }

    // Mark as sent + schedule push per user
    for (const [userId, userActions] of byUser) {
      await Promise.all(
        userActions.map((a) => ctx.db.patch(a._id, { reminderSentAt: now })),
      );

      const count = userActions.length;
      const first = userActions[0];
      const dreamTitle = dreamMap.get(first.dreamId)?.title ?? 'your dream';

      const title = count === 1 ? 'Reminder' : `${count} reminders`;
      const body =
        count === 1
          ? `"${first.text}" — ${dreamTitle}`
          : `"${first.text}" and ${count - 1} more`;

      await ctx.scheduler.runAfter(
        0,
        internal.notificationsSend.sendPushNotificationInternal,
        { userId, title, body, data: { type: 'reminder', actionId: first._id } },
      );
    }

    return { checked: validActions.length, users: byUser.size };
  },
});
