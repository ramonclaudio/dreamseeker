import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Mood } from '@/constants/dreams';
import { timezone } from '@/lib/timezone';

export function useCheckIn() {
  const checkIns = useQuery(api.checkIns.getTodayCheckIns, { timezone });
  const submitMorningMutation = useMutation(api.checkIns.submitMorning);
  const submitEveningMutation = useMutation(api.checkIns.submitEvening);
  const removeMutation = useMutation(api.checkIns.remove);

  return {
    morningCheckIn: checkIns?.morning ?? null,
    eveningCheckIn: checkIns?.evening ?? null,
    isLoading: checkIns === undefined,
    submitMorning: async (mood: Mood, intention?: string) => {
      await submitMorningMutation({ mood, intention, timezone });
    },
    submitEvening: async (reflection?: string) => {
      await submitEveningMutation({ reflection, timezone });
    },
  };
}
