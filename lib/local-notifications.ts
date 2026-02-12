import * as Notifications from "expo-notifications";

/**
 * Schedule a local notification for an action reminder.
 * Uses the action ID as the notification identifier so it can be cancelled later.
 */
export async function scheduleActionReminder({
  actionId,
  actionText,
  dreamTitle,
  reminderMs,
}: {
  actionId: string;
  actionText: string;
  dreamTitle: string;
  reminderMs: number;
}): Promise<void> {
  const secondsUntil = Math.round((reminderMs - Date.now()) / 1000);
  if (secondsUntil <= 0) return; // Already passed

  // Cancel any existing notification for this action first
  await cancelActionReminder(actionId);

  await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${actionId}`,
    content: {
      title: "Reminder",
      body: `"${actionText}" — ${dreamTitle}`,
      data: { type: "reminder", actionId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
    },
  });
}

/**
 * Cancel a previously scheduled reminder for an action.
 */
export async function cancelActionReminder(actionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`reminder-${actionId}`);
}
