import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export type TabBadges = {
  home: string | null;
  tasks: string | null;
  explore: string | null;
  profile: string | null;
  settings: string | null;
};

/**
 * Hook to manage tab badge counts.
 * Returns badge values for each tab - null means no badge, empty string means dot badge.
 *
 * Usage:
 * - `null` = no badge
 * - `""` = dot badge (no text)
 * - `"3"` = badge with count
 * - `"9+"` = badge with overflow
 */
export function useTabBadges(): TabBadges {
  // Query incomplete tasks for the tasks tab badge
  const tasks = useQuery(api.tasks.list);

  // Count incomplete tasks
  const incompleteTasks = tasks?.filter((t) => !t.isCompleted).length ?? 0;

  // Format badge text - show count up to 9, then "9+"
  const tasksBadge = incompleteTasks === 0 ? null : incompleteTasks > 9 ? '9+' : String(incompleteTasks);

  return {
    home: null,
    tasks: tasksBadge,
    explore: null,
    profile: null,
    settings: null,
  };
}
