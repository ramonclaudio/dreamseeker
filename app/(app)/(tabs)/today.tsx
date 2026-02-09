import { View, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { GradientButton } from "@/components/ui/gradient-button";
import { SkeletonActionItem, SkeletonListItem } from "@/components/ui/skeleton";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StreakDisplay } from "@/components/engagement/streak-display";
import { BadgeEarnedModal } from "@/components/engagement/badge-earned-modal";
import { StreakMilestoneToast } from "@/components/engagement/streak-milestone-toast";
import { WeeklyCalendarStrip } from "@/components/today/weekly-calendar-strip";
import { GetStartedCards } from "@/components/today/get-started-cards";
import { MorningCheckIn } from "@/components/today/morning-check-in";
import { DailyReview } from "@/components/today/daily-review";
import { TodayActionItem } from "@/components/today/action-item";
import { MindsetCard } from "@/components/today/mindset-card";
import { GabbyTipCard } from "@/components/today/gabby-tip-card";
import { WeeklyReviewCard } from "@/components/today/weekly-review-card";
import { DailyChallengeCard } from "@/components/today/daily-challenge-card";
import { QuickActions } from "@/components/today/quick-actions";
import { useColors } from "@/hooks/use-color-scheme";
import { useToday } from "@/hooks/use-today";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_HEIGHT } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

type PendingAction = {
  _id: string;
  text: string;
  dreamTitle: string;
  dreamCategory?: string;
};

export default function TodayScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const {
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
  } = useToday();

  const handleCreatePress = () => {
    if (!canCreateDream) {
      haptics.warning();
      showUpgrade();
      return;
    }
    haptics.medium();
    router.push("/(app)/create-dream");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT,
          paddingHorizontal: Spacing.lg,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Greeting */}
        <View
          style={{
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <ThemedText
              variant="title"
              accessibilityRole="header"
            >
              {user?.displayName || user?.name ? `Hi, ${(user.displayName ?? user.name)!.split(" ")[0]}` : "Home"}
            </ThemedText>
            <ThemedText color={colors.mutedForeground}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              {totalDreams > 0
                ? ` · ${totalDreams} ${totalDreams === 1 ? "dream" : "dreams"}`
                : ""}
            </ThemedText>
          </View>
          <UserAvatar />
        </View>

        {/* Streak Display */}
        {isLoading ? (
          <View style={{ marginBottom: Spacing.lg }}>
            <SkeletonListItem />
          </View>
        ) : (
          progress &&
          progress.currentStreak > 0 && (
            <View
              style={{ marginBottom: Spacing.lg }}
              accessible={true}
              accessibilityLabel={`Current streak: ${progress.currentStreak} ${progress.currentStreak === 1 ? "day" : "days"}`}
            >
              <StreakDisplay currentStreak={progress.currentStreak} />
            </View>
          )
        )}

        {/* Weekly Calendar Strip */}
        {isLoading ? (
          <SkeletonListItem />
        ) : (
          weeklyActivity !== undefined && (
            <WeeklyCalendarStrip weeklyActivity={weeklyActivity} />
          )
        )}

        {/* Gabby's Daily Tip */}
        {isLoading ? (
          <SkeletonListItem />
        ) : (
          mindsetMoment && (
            <GabbyTipCard quote={mindsetMoment.quote} colors={colors} />
          )
        )}

        {/* Weekly Review Card */}
        {!isLoading && weeklySummary && (weeklySummary.actionsCompleted > 0 || weeklySummary.journalEntries > 0) && (
          <WeeklyReviewCard summary={weeklySummary} colors={colors} />
        )}

        {/* Create Dream CTA */}
        <View style={{ marginBottom: Spacing.lg }}>
          <GradientButton
            onPress={handleCreatePress}
            label="Create a Dream"
            accessibilityHint={canCreateDream ? "Opens the dream creation flow" : "Opens upgrade screen to unlock more dreams"}
            icon={
              <IconSymbol
                name={dreamsRemaining === 1 ? "sparkles" : "plus"}
                size={IconSize.xl}
                color={colors.onColor}
                weight="bold"
              />
            }
          />
          {dreamsRemaining !== null && dreamsRemaining > 0 && (
            <View
              style={{
                alignSelf: "center",
                marginTop: Spacing.md,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.xs,
                borderRadius: Radius.full,
                backgroundColor: colors.surfaceTinted,
                borderWidth: 1,
                borderColor: dreamsRemaining === 1 ? colors.borderAccentStrong : colors.borderAccent,
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.sm, fontWeight: "600" }}
                color={dreamsRemaining === 1 ? colors.primary : colors.accentBlue}
              >
                {dreamsRemaining === 1 ? "Last free dream!" : `${dreamsRemaining} free dreams remaining`}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Get Started Cards (new users only) */}
        {totalDreams === 0 && getStartedCards.length > 0 && (
          <GetStartedCards
            cards={getStartedCards}
            onDismiss={dismissGetStarted}
            onPress={(action) => router.push(action as never)}
          />
        )}

        {/* Morning Check-in */}
        {!isLoading && showMorningCheckIn && (
          <MorningCheckIn
            name={(user?.displayName ?? user?.name)?.split(" ")[0]}
            onSubmit={submitMorning}
          />
        )}

        {!isLoading && mindsetMoment && (
          <MindsetCard
            quote={mindsetMoment.quote}
            author={mindsetMoment.author}
            colors={colors}
          />
        )}

        {!isLoading && dailyChallenge && (
          <DailyChallengeCard
            title={dailyChallenge.title}
            description={dailyChallenge.description}
            xpReward={dailyChallenge.xpReward}
            isCompleted={dailyChallenge.isCompleted}
            onComplete={handleCompleteChallenge}
            colors={colors}
          />
        )}

        {!isLoading && <QuickActions colors={colors} />}

        {/* Pending Actions */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: Spacing.sm,
              marginLeft: Spacing.xs,
            }}
          >
            <ThemedText
              style={{
                fontSize: FontSize.base,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
              color={colors.mutedForeground}
              accessibilityRole="header"
            >
              Pending Actions
            </ThemedText>
            <ThemedText
              style={{ fontSize: FontSize.sm }}
              color={colors.mutedForeground}
            >
              {pendingActions?.length ?? 0} remaining
            </ThemedText>
          </View>

          {isLoading ? (
            <>
              <SkeletonActionItem />
              <SkeletonActionItem />
              <SkeletonActionItem />
            </>
          ) : pendingActions && pendingActions.length > 0 ? (
            pendingActions.map((action: PendingAction) => (
              <TodayActionItem
                key={action._id}
                action={action as PendingAction}
                colors={colors}
                onToggle={() => handleToggleAction(action._id)}
              />
            ))
          ) : (
            <MaterialCard
              style={{ padding: Spacing.xl, alignItems: "center" }}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={IconSize["4xl"]}
                color={colors.accentBlue}
              />
              <ThemedText
                style={{
                  fontSize: FontSize.lg,
                  marginTop: Spacing.md,
                  textAlign: "center",
                }}
                color={colors.mutedForeground}
              >
                {"You're all caught up, queen! Look at you handling business."}
              </ThemedText>
            </MaterialCard>
          )}
        </View>

        {/* Daily Review */}
        {!isLoading && showDailyReview && completedToday && (
          <View style={{ marginTop: Spacing.xl }}>
            <DailyReview
              completedActions={completedToday.map((a) => ({
                text: a.text,
                dreamTitle: a.dreamTitle,
              }))}
              onSubmit={submitEvening}
            />
          </View>
        )}
      </ScrollView>

      {/* Badge Earned Modal */}
      <BadgeEarnedModal
        visible={newBadge !== null}
        badge={newBadge}
        onDismiss={() => setNewBadge(null)}
      />

      {/* Streak Milestone Toast */}
      <StreakMilestoneToast
        visible={streakMilestone !== null}
        streak={streakMilestone?.streak ?? 0}
        xpReward={streakMilestone?.xpReward ?? 0}
        onDismiss={() => setStreakMilestone(null)}
      />
    </View>
  );
}
