import { View, ScrollView, RefreshControl } from "react-native";
import { useQuery, useConvexAuth } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import ViewShot from "react-native-view-shot";

import { api } from "@/convex/_generated/api";
import { SkeletonDreamCard } from "@/components/ui/skeleton";
import { TabHeader } from "@/components/ui/tab-header";
import { ProgressSummaryCard } from "@/components/dreams/progress-summary-card";
import { EmptyState } from "@/components/dreams/empty-state";
import { CompactDreamRow } from "@/components/dreams/compact-dream-row";
import { GoalsShareCard } from "@/components/share-cards/goals-share-card";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { useColors } from "@/hooks/use-color-scheme";
import { useSubscription } from "@/hooks/use-subscription";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, MaxWidth, TAB_BAR_CLEARANCE } from "@/constants/layout";
import { timezone } from "@/lib/timezone";
import { haptics } from "@/lib/haptics";
import { FREE_MAX_DREAMS } from "@/convex/constants";

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function DreamsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const isFocused = useIsFocused();
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const { showUpgrade, canCreateDream } = useSubscription();

  // Always active — needed for main UI
  const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
  const dreams = useQuery(
    api.dreams.listWithActionCounts,
    isAuthenticated ? {} : "skip"
  );
  const progress = useQuery(
    api.progress.getProgress,
    isAuthenticated ? { timezone } : "skip"
  );

  // Expensive — only used for offscreen share card
  const allDreams = useQuery(
    api.dreams.listAllWithActionCounts,
    isAuthenticated && isFocused ? {} : "skip"
  );

  const isLoading = authLoading || dreams === undefined || progress === undefined;
  const hasDreams = !isLoading && dreams.length > 0;

  const handleCreateDream = () => {
    haptics.light();
    if (!canCreateDream) {
      showUpgrade();
      return;
    }
    router.push("/(app)/create-dream/");
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
          title="Dreams"
          subtitle="Your goals, your way"
          onShare={hasDreams ? capture : undefined}
          shareDisabled={isSharing}
          onAdd={handleCreateDream}
          addLabel="Create new dream"
        />


        {isLoading ? (
          <View style={{ gap: Spacing.xl }}>
            <SkeletonDreamCard />
            <SkeletonDreamCard />
            <SkeletonDreamCard />
          </View>
        ) : hasDreams ? (
          <View style={{ gap: Spacing.lg }}>
            {/* Compact progress strip */}
            <ProgressSummaryCard
              progress={progress}
              dreamCount={dreams.length}
              colors={colors}
              onLevelPress={() => router.push('/(app)/(tabs)/progress')}
            />

            {/* All dreams */}
            {dreams.map((dream) => (
              <CompactDreamRow
                key={dream._id}
                dream={dream}
                colors={colors}
              />
            ))}

            {/* Upgrade banner when approaching/at dream limit */}
            <UpgradeBanner used={dreams.length} limit={FREE_MAX_DREAMS} noun="Dreams" />
          </View>
        ) : (
          <EmptyState colors={colors} canCreateDream={canCreateDream} onUpgrade={showUpgrade} />
        )}
      </ScrollView>

      {/* Off-screen vision board share card */}
      {allDreams && allDreams.length > 0 && (
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={{ position: "absolute", left: -9999 }}>
          <GoalsShareCard
            dreams={allDreams}
            handle={user?.displayName ?? user?.name ?? undefined}
          />
        </ViewShot>
      )}
    </View>
  );
}
