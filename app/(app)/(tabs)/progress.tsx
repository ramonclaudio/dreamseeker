import { View, ScrollView, RefreshControl } from "react-native";
import { useQuery, useConvexAuth } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { SkeletonStatsCard, SkeletonListItem } from "@/components/ui/skeleton";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { UserAvatar } from "@/components/ui/user-avatar";
import { BadgeGallery } from "@/components/engagement/badge-gallery";
import { StatsOverview } from "@/components/progress/stats-overview";
import { LevelProgressCard } from "@/components/progress/level-progress-card";
import { StreakCards } from "@/components/progress/streak-cards";
import { StreakHeatmap } from "@/components/progress/streak-heatmap";
import { LevelJourney } from "@/components/progress/level-journey";
import { DreamsList } from "@/components/progress/dreams-list";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_HEIGHT } from "@/constants/layout";
import { getLevelFromXp, getXpToNextLevel } from "@/constants/dreams";
import { timezone } from "@/lib/timezone";

export default function ProgressScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { isLoading: authLoading } = useConvexAuth();

  const progress = useQuery(api.progress.getProgress, { timezone });
  const activityHeatmap = useQuery(api.progress.getActivityHeatmap, { timezone });
  const mindsetMoments = useQuery(api.mindset.list, {});
  const completedDreams = useQuery(api.dreams.listByStatus, { status: 'completed' as const });
  const archivedDreams = useQuery(api.dreams.listByStatus, { status: 'archived' as const });

  const isLoading = authLoading || progress === undefined;

  const currentLevel = !isLoading ? getLevelFromXp(progress.totalXp) : { level: 1, title: '', emoji: '', xpMin: 0, xpMax: 100 };
  const xpProgress = !isLoading ? getXpToNextLevel(progress.totalXp) : { current: 0, needed: 100, progress: 0 };

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
      {/* Header */}
      <View style={{ paddingTop: Spacing.lg, paddingBottom: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <ThemedText
            variant="title"
            accessibilityRole="header"
          >
            Progress
          </ThemedText>
          <ThemedText color={colors.mutedForeground}>
            Every step counts. Own how far you&apos;ve come.
          </ThemedText>
        </View>
        <UserAvatar />
      </View>

      {isLoading ? (
        <>
          <SkeletonStatsCard />
          <SkeletonStatsCard />
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </>
      ) : (
        <>
          <StatsOverview
            dreamsCompleted={progress.dreamsCompleted}
            actionsCompleted={progress.actionsCompleted}
            colors={colors}
          />

          <LevelProgressCard
            currentLevel={currentLevel}
            totalXp={progress.totalXp}
            xpProgress={xpProgress}
            colors={colors}
          />

          <StreakCards
            currentStreak={progress.currentStreak}
            longestStreak={progress.longestStreak}
            colors={colors}
          />

          {/* Activity Heatmap */}
          {activityHeatmap && (
            <View>
              <ThemedText
                style={{
                  fontSize: FontSize.base,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: Spacing.sm,
                  marginLeft: Spacing.xs,
                }}
                color={colors.mutedForeground}
                accessibilityRole="header"
              >
                Consistency Map
              </ThemedText>
              <MaterialCard
                variant="tinted"
                style={{
                  padding: Spacing.lg,
                }}
              >
                <StreakHeatmap
                  activityData={activityHeatmap.activityData}
                  currentStreak={activityHeatmap.currentStreak}
                  longestStreak={activityHeatmap.longestStreak}
                  colors={colors}
                  timezone={timezone}
                />
              </MaterialCard>
            </View>
          )}

          <BadgeGallery />

          <LevelJourney
            totalXp={progress.totalXp}
            currentLevel={currentLevel.level}
            colors={colors}
          />

          <DreamsList
            dreams={completedDreams ?? []}
            title="Completed Dreams"
            colors={colors}
          />

          <DreamsList
            dreams={archivedDreams ?? []}
            title="Archived Dreams"
            isArchived
            colors={colors}
          />
        </>
      )}

      {/* Mindset Moment */}
      {mindsetMoments && mindsetMoments.length > 0 && (
        <View>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: Spacing.sm,
              marginLeft: Spacing.xs,
            }}
            color={colors.mutedForeground}
            accessibilityRole="header"
          >
            Mindset Moment
          </ThemedText>
          <MaterialCard
            style={{
              padding: Spacing.xl,
              backgroundColor: colors.surfaceTinted,
              borderLeftWidth: 3,
              borderLeftColor: colors.accentBlue,
            }}
          >
            <IconSymbol
              name="quote.bubble.fill"
              size={IconSize["2xl"]}
              color={colors.mutedForeground}
              style={{ marginBottom: Spacing.sm }}
            />
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                fontStyle: "italic",
                lineHeight: 24,
              }}
            >
              {`"${mindsetMoments[0].quote}"`}
            </ThemedText>
            <ThemedText
              style={{ fontSize: FontSize.sm, marginTop: Spacing.sm }}
              color={colors.mutedForeground}
            >
              — {mindsetMoments[0].author}
            </ThemedText>
          </MaterialCard>
        </View>
      )}
    </ScrollView>
    </View>
  );
}
