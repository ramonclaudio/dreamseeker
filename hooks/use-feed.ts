import { useQuery, useMutation } from 'convex/react';
import { useState, useCallback, useMemo } from 'react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export function useFeed() {
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  const result = useQuery(api.feed.getFriendFeed, { cursor, limit: 30 });

  const events = result?.events ?? [];
  const isLoading = result === undefined;
  const hasMore = result?.nextCursor !== null && result?.nextCursor !== undefined;

  const loadMore = useCallback(() => {
    if (result?.nextCursor != null) {
      setCursor(result.nextCursor);
    }
  }, [result?.nextCursor]);

  // Reactions — derive event IDs from the query result directly to keep ref stable
  const eventIds = useMemo(
    () => (result?.events ?? []).map((e) => e._id as Id<'activityFeed'>),
    [result?.events]
  );

  const reactions = useQuery(
    api.feed.getReactionsForEvents,
    eventIds.length > 0 ? { eventIds } : 'skip'
  );

  const toggleReactionMutation = useMutation(api.feed.toggleReaction);

  const toggleReaction = useCallback(
    (eventId: string, emoji: 'fire' | 'heart' | 'clap') =>
      toggleReactionMutation({
        feedEventId: eventId as Id<'activityFeed'>,
        emoji,
      }),
    [toggleReactionMutation]
  );

  return {
    events,
    isLoading,
    hasMore,
    loadMore,
    reactions: reactions ?? {},
    toggleReaction,
  };
}
