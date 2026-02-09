import { STREAK_MILESTONES, STREAK_XP_REWARDS } from './constants';

/** Minimal shape of userProgress needed for streak calculations. */
export interface StreakProgress {
  currentStreak: number;
  lastActiveDate: string;
  longestStreak: number;
  streakMilestones?: number[];
}

/** Determine new streak value based on last active date. */
export function calculateStreak(
  currentStreak: number,
  lastActiveDate: string,
  today: string,
  yesterday: string
): number {
  if (lastActiveDate === today) return currentStreak; // Already active today
  if (lastActiveDate === yesterday) return currentStreak + 1; // Consecutive day
  return 1; // Streak broken, start fresh
}

/** Return newly-earned milestones for a given streak. */
export function checkStreakMilestones(
  newStreak: number,
  existingMilestones: number[]
): { milestone: number; xpReward: number }[] {
  return STREAK_MILESTONES.filter(
    (m) => newStreak >= m && !existingMilestones.includes(m)
  ).map((m) => ({ milestone: m, xpReward: STREAK_XP_REWARDS[m] ?? 0 }));
}

/**
 * Pure function that computes the streak/milestone patch fields for an
 * existing progress record. Does NOT touch the database.
 */
export function computeStreakUpdate(
  progress: StreakProgress,
  today: string,
  yesterday: string,
  skipStreak: boolean
): {
  newStreak: number;
  milestoneXp: number;
  streakMilestone: { streak: number; xpReward: number } | null;
  patch: Record<string, unknown>;
} {
  const newStreak = skipStreak
    ? progress.currentStreak
    : calculateStreak(progress.currentStreak, progress.lastActiveDate, today, yesterday);

  let milestoneXp = 0;
  let streakMilestone: { streak: number; xpReward: number } | null = null;
  const patch: Record<string, unknown> = {};

  if (!skipStreak) {
    patch.currentStreak = newStreak;
    patch.longestStreak = Math.max(progress.longestStreak, newStreak);

    const results = checkStreakMilestones(newStreak, progress.streakMilestones ?? []);
    if (results.length > 0) {
      milestoneXp = results.reduce((sum, r) => sum + r.xpReward, 0);
      patch.streakMilestones = [...(progress.streakMilestones ?? []), ...results.map((r) => r.milestone)];
      streakMilestone = { streak: newStreak, xpReward: milestoneXp };
    }
  }

  return { newStreak, milestoneXp, streakMilestone, patch };
}
