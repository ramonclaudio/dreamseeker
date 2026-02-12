import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useIsFocused } from "@react-navigation/native";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCheckIn } from "@/hooks/use-check-in";
import { useSubscription } from "@/hooks/use-subscription";
import { useGetStarted } from "@/hooks/use-get-started";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import { timezone } from "@/lib/timezone";
import { cancelActionReminder } from "@/lib/local-notifications";

export function useToday() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const isFocused = useIsFocused();

  // Cheap queries — always active
  const progress = useQuery(api.progress.getProgress, { timezone });
  const dailyChallenge = useQuery(api.challenges.getDaily, { timezone });
  const mindsetMoment = useQuery(api.mindset.getRandom, { timezone });
  const pendingActions = useQuery(
    api.actions.listPending,
    isAuthenticated ? {} : "skip"
  );
  const user = useQuery(api.auth.getCurrentUser);
  const categoryCounts = useQuery(
    api.dreams.getCategoryCounts,
    isAuthenticated ? {} : "skip"
  );

  // Expensive queries — skip when tab is not focused
  const weeklyActivity = useQuery(
    api.progress.getWeeklyActivity,
    isAuthenticated && isFocused ? { timezone } : "skip"
  );
  const weeklySummary = useQuery(
    api.progress.getWeeklySummary,
    isAuthenticated && isFocused ? { timezone } : "skip"
  );
  const completedToday = useQuery(
    api.actions.listCompletedToday,
    isAuthenticated && isFocused ? { timezone } : "skip"
  );

  const { morningCheckIn, eveningCheckIn, submitMorning, submitEvening } =
    useCheckIn();
  const { canCreateDream, dreamsRemaining, showUpgrade } = useSubscription();
  const { cards: getStartedCards, dismiss: dismissGetStarted } =
    useGetStarted();

  const toggleAction = useMutation(api.actions.toggle);
  const completeChallenge = useMutation(api.challenges.complete);

  const [newBadge, setNewBadge] = useState<{
    key: string;
    title: string;
    description?: string;
    icon?: string;
  } | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<{
    streak: number;
    xpReward: number;
  } | null>(null);
  const [showFirstAction, setShowFirstAction] = useState(false);
  const [showAllDone, setShowAllDone] = useState(false);
  const [reflectionFeeling, setReflectionFeeling] = useState<string | null>(null);
  const pendingCountRef = useRef(0);

  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (pendingActions !== undefined) {
      const prevCount = pendingCountRef.current;
      const newCount = pendingActions.length;
      // Detect all-done: went from >0 to 0
      if (prevCount > 0 && newCount === 0) {
        setShowAllDone(true);
      }
      pendingCountRef.current = newCount;
    }
  }, [pendingActions]);

  const showMorningCheckIn = currentHour < 12 && !morningCheckIn;
  const showDailyReview =
    currentHour >= 17 &&
    !eveningCheckIn &&
    (completedToday?.length ?? 0) > 0;

  const totalDreams = useMemo(() => {
    if (!categoryCounts) return 0;
    return (Object.values(categoryCounts) as number[]).reduce(
      (a, b) => a + b,
      0
    );
  }, [categoryCounts]);

  const isLoading = authLoading || progress === undefined;

  const handleToggleAction = useCallback(
    async (id: string) => {
      try {
        const result = await toggleAction({
          id: id as Id<"actions">,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
          timezone,
        });
        // Cancel local reminder when completing
        cancelActionReminder(id);
        // Haptic already fires in TodayActionItem — no duplicate here
        if (result?.isFirstAction) setShowFirstAction(true);
        if (result?.newBadge) setNewBadge(result.newBadge);
        if (result?.streakMilestone) setStreakMilestone(result.streakMilestone);
      } catch {
        haptics.error();
      }
    },
    [toggleAction]
  );

  const handleCompleteChallenge = useCallback(async () => {
    if (!dailyChallenge || dailyChallenge.isCompleted) return;
    try {
      const result = await completeChallenge({
        challengeId: dailyChallenge._id,
        timezone,
      });
      haptics.success();
      shootConfetti();
      if (result?.newBadge) setNewBadge(result.newBadge);
      if (result?.streakMilestone) setStreakMilestone(result.streakMilestone);
    } catch {
      haptics.error();
    }
  }, [completeChallenge, dailyChallenge]);

  return {
    progress,
    dailyChallenge,
    mindsetMoment,
    pendingActions,
    weeklyActivity,
    weeklySummary,
    completedToday,
    user,
    totalDreams,
    newBadge,
    setNewBadge,
    streakMilestone,
    setStreakMilestone,
    showMorningCheckIn,
    showDailyReview,
    submitMorning,
    submitEvening,
    canCreateDream,
    dreamsRemaining,
    showUpgrade,
    getStartedCards,
    dismissGetStarted,
    isLoading,
    handleToggleAction,
    handleCompleteChallenge,
    showFirstAction,
    setShowFirstAction,
    showAllDone,
    setShowAllDone,
    reflectionFeeling,
    setReflectionFeeling,
  };
}
