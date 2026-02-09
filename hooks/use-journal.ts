import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Mood } from '@/constants/dreams';
import { timezone } from '@/lib/timezone';

export function useJournal() {
  const entries = useQuery(api.journal.list);
  const todayCount = useQuery(api.journal.getTodayCount, { timezone });
  const createMutation = useMutation(api.journal.create);
  const updateMutation = useMutation(api.journal.update);
  const removeMutation = useMutation(api.journal.remove);

  return {
    entries: entries ?? [],
    todayCount: todayCount ?? 0,
    isLoading: entries === undefined,
    create: async (args: {
      title: string;
      body: string;
      mood?: Mood;
      dreamId?: Id<'dreams'>;
      tags?: string[];
    }) => createMutation({ ...args, timezone }),
    update: async (args: {
      id: Id<'journalEntries'>;
      title?: string;
      body?: string;
      mood?: Mood;
      dreamId?: Id<'dreams'>;
      tags?: string[];
    }) => updateMutation(args),
    remove: async (id: Id<'journalEntries'>) => removeMutation({ id }),
  };
}
