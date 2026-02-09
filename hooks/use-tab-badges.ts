import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export type TabBadges = {
  dreams: string | null;
  today: string | null;
  community: string | null;
  progress: string | null;
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
  const pendingFriendRequests = useQuery(api.friends.getPendingCount);

  // Count pending actions
  const pendingCount = pendingActions?.length ?? 0;
  const friendRequestCount = pendingFriendRequests ?? 0;

  // Format badge text - show count up to 9, then "9+"
  const todayBadge = pendingCount === 0 ? null : pendingCount > 9 ? '9+' : String(pendingCount);
  const communityBadge = friendRequestCount === 0 ? null : friendRequestCount > 9 ? '9+' : String(friendRequestCount);

  return {
    dreams: null,
    today: todayBadge,
    community: communityBadge,
    progress: null,
    profile: null,
  };
}
