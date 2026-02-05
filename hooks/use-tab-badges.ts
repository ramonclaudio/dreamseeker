import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export type TabBadges = {
  home: string | null;
  today: string | null;
  explore: string | null;
  profile: string | null;
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
  // Query pending actions for the Today tab badge
  const pendingActions = useQuery(api.actions.listPending);

  // Count pending actions
  const pendingCount = pendingActions?.length ?? 0;

  // Format badge text - show count up to 9, then "9+"
  const todayBadge = pendingCount === 0 ? null : pendingCount > 9 ? '9+' : String(pendingCount);

  return {
    home: null,
    today: todayBadge,
    explore: null,
    profile: null,
  };
}
