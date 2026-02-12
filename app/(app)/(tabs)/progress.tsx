import { View, ScrollView, RefreshControl, Pressable, Animated as RNAnimated } from "react-native";
import { useQuery, useConvexAuth } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import ViewShot from "react-native-view-shot";

import { api } from "@/convex/_generated/api";
import { SkeletonStatsCard, SkeletonListItem } from "@/components/ui/skeleton";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { TabHeader } from "@/components/ui/tab-header";
import { ProgressShareCard } from "@/components/share-cards/progress-share-card";
import { ConsistencyShareCard } from "@/components/share-cards/consistency-share-card";
import { BadgeGallery } from "@/components/engagement/badge-gallery";
import { StatsOverview } from "@/components/progress/stats-overview";
import { LevelProgressCard } from "@/components/progress/level-progress-card";
import { StreakHeatmap } from "@/components/progress/streak-heatmap";
import { LevelJourney } from "@/components/progress/level-journey";
import { DreamsList } from "@/components/progress/dreams-list";
import { useColors, useColorScheme } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_CLEARANCE } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { getLevelFromXp, getXpToNextLevel } from "@/constants/dreams";
import { Opacity } from "@/constants/ui";
import { timezone } from "@/lib/timezone";

const MINDSET_COLORS = {
  light: { bg: "#EAE0F8", text: "#2D2019", sub: "#5A4B3D" },
  dark: { bg: "#262030", text: "#F5EDE6", sub: "#C4B5A5" },
} as const;

export default function ProgressScreen() {
  const colors = useColors();
  const scheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { isLoading: authLoading } = useConvexAuth();
  const isFocused = useIsFocused();

  const { viewShotRef: progressShotRef, capture: captureProgress, isSharing: isSharingProgress } = useShareCapture();
  const { viewShotRef: heatmapShotRef, capture: captureHeatmap, isSharing: isSharingHeatmap } = useShareCapture();

  // Cheap queries — always active
  const user = useQuery(api.auth.getCurrentUser);
  const progress = useQuery(api.progress.getProgress, { timezone });

  // Expensive queries — skip when tab is not focused
  const activityHeatmap = useQuery(api.progress.getActivityHeatmap, isFocused ? { timezone } : "skip");
  const mindsetMoments = useQuery(api.mindset.list, isFocused ? {} : "skip");
  const completedDreams = useQuery(api.dreams.listByStatus, isFocused ? { status: 'completed' as const } : "skip");
  const archivedDreams = useQuery(api.dreams.listByStatus, isFocused ? { status: 'archived' as const } : "skip");
  const badges = useQuery(api.badges.getUserBadges, isFocused ? {} : "skip");

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
        paddingBottom: TAB_BAR_CLEARANCE,
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
      <TabHeader
        title="Progress"
        subtitle="Your stats, streaks, and milestones."
        onShare={!isLoading ? captureProgress : undefined}
        shareDisabled={isSharingProgress}
      />

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
            totalXp={progress.totalXp}
            scheme={scheme}
          />

          <LevelProgressCard
            currentLevel={currentLevel}
            totalXp={progress.totalXp}
            xpProgress={xpProgress}
            colors={colors}
            scheme={scheme}
          />

          {/* Activity Heatmap */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.sm }}>
              <ThemedText
                style={{
                  fontSize: FontSize.base,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginLeft: Spacing.xs,
                }}
                color={colors.mutedForeground}
                accessibilityRole="header"
              >
                Consistency Map
              </ThemedText>
              {activityHeatmap && (
                <Pressable
                  onPress={captureHeatmap}
                  disabled={isSharingHeatmap}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
                  accessibilityLabel="Share consistency map"
                >
                  <IconSymbol name="square.and.arrow.up" size={IconSize.lg} color={colors.primary} />
                </Pressable>
              )}
            </View>
            <View
              style={{
                backgroundColor: colors.surfaceTinted,
                borderRadius: Radius["2xl"],
                padding: Spacing.lg,
              }}
            >
              {activityHeatmap ? (
                <StreakHeatmap
                  activityData={activityHeatmap.activityData}
                  currentStreak={activityHeatmap.currentStreak}
                  longestStreak={activityHeatmap.longestStreak}
                  colors={colors}
                  timezone={timezone}
                />
              ) : (
                <HeatmapSkeleton colors={colors} timezone={timezone} />
              )}
            </View>
          </View>

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
          <View
            style={{
              padding: Spacing.xl,
              backgroundColor: MINDSET_COLORS[scheme].bg,
              borderRadius: Radius["2xl"],
            }}
          >
            <IconSymbol
              name="quote.bubble.fill"
              size={IconSize["2xl"]}
              color={MINDSET_COLORS[scheme].sub}
              style={{ marginBottom: Spacing.sm }}
            />
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                fontStyle: "italic",
                lineHeight: 24,
              }}
              color={MINDSET_COLORS[scheme].text}
            >
              {`"${mindsetMoments[0].quote}"`}
            </ThemedText>
            <ThemedText
              style={{ fontSize: FontSize.sm, marginTop: Spacing.sm }}
              color={MINDSET_COLORS[scheme].sub}
            >
              — {mindsetMoments[0].author}
            </ThemedText>
          </View>
        </View>
      )}
    </ScrollView>

      {/* Offscreen share card for full progress */}
      {!isLoading && activityHeatmap && (
        <ViewShot ref={progressShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
          <ProgressShareCard
            handle={user?.displayName ?? user?.name ?? undefined}
            dreamsCompleted={progress.dreamsCompleted}
            actionsCompleted={progress.actionsCompleted}
            totalXp={progress.totalXp}
            level={currentLevel.level}
            levelTitle={currentLevel.title}
            currentStreak={activityHeatmap.currentStreak}
            longestStreak={activityHeatmap.longestStreak}
            badgeCount={badges?.length ?? 0}
            activityData={activityHeatmap?.activityData}
          />
        </ViewShot>
      )}

      {/* Offscreen share card for consistency map */}
      {activityHeatmap && (
        <ViewShot ref={heatmapShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
          <ConsistencyShareCard
            handle={user?.displayName ?? user?.name ?? undefined}
            currentStreak={activityHeatmap.currentStreak}
            longestStreak={activityHeatmap.longestStreak}
            activityData={activityHeatmap.activityData}
          />
        </ViewShot>
      )}
    </View>
  );
}

// ── Heatmap Skeleton ──────────────────────────────────────────────────────────

function HeatmapSkeleton({ colors, timezone }: { colors: ReturnType<typeof useColors>; timezone: string }) {
  const opacity = useRef(new RNAnimated.Value(0.4)).current;

  useEffect(() => {
    const anim = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <RNAnimated.View style={{ opacity }}>
      <StreakHeatmap
        activityData={{}}
        currentStreak={0}
        longestStreak={0}
        colors={colors}
        timezone={timezone}
      />
    </RNAnimated.View>
  );
}
