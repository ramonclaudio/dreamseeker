import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import { useQuery, useConvexAuth } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { SkeletonDreamCard, SkeletonStatsCard } from "@/components/ui/skeleton";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProBadge } from "@/components/ui/pro-badge";
import { ProgressSummaryCard } from "@/components/dreams/progress-summary-card";
import { CategorySection, EmptyCategoryCards } from "@/components/dreams/category-section";
import { EmptyState } from "@/components/dreams/empty-state";
import { type DreamWithCounts } from "@/components/dreams/compact-dream-row";
import { useColors } from "@/hooks/use-color-scheme";
import { useSubscription } from "@/hooks/use-subscription";
import { Spacing, MaxWidth, IconSize, TAB_BAR_HEIGHT, FontSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { Radius } from "@/constants/theme";
import {
  DREAM_CATEGORY_LIST,
  type DreamCategory,
} from "@/constants/dreams";
import { timezone } from "@/lib/timezone";
import { haptics } from "@/lib/haptics";

// ── Types ────────────────────────────────────────────────────────────────────

type GroupedDreams = Partial<Record<DreamCategory, DreamWithCounts[]>>;

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function DreamsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { isPremium, dreamsRemaining, canCreateDream, showUpgrade } = useSubscription();

  const dreams = useQuery(
    api.dreams.listWithActionCounts,
    isAuthenticated ? {} : "skip"
  );
  const progress = useQuery(
    api.progress.getProgress,
    isAuthenticated ? { timezone } : "skip"
  );

  const isLoading = authLoading || dreams === undefined || progress === undefined;

  const grouped: GroupedDreams = !isLoading
    ? (() => {
        const result: GroupedDreams = {};
        for (const dream of dreams) {
          (result[dream.category] ??= []).push(dream);
        }
        return result;
      })()
    : {};

  const activeCategories = !isLoading
    ? DREAM_CATEGORY_LIST.filter((c) => grouped[c] && grouped[c]!.length > 0)
    : [];
  const emptyCategories = !isLoading
    ? DREAM_CATEGORY_LIST.filter((c) => !grouped[c] || grouped[c]!.length === 0)
    : [];

  const hasDreams = !isLoading && dreams.length > 0;
  const showLimitWarning = !isLoading && !isPremium && dreamsRemaining !== null && dreamsRemaining <= 1;

  const handleCreateDream = () => {
    if (!canCreateDream) {
      haptics.warning();
      showUpgrade();
      return;
    }
    haptics.light();
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
        <View
          style={{
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
            <ThemedText
              variant="title"
              accessibilityRole="header"
            >
              Dreams
            </ThemedText>
            {showLimitWarning && <ProBadge />}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.md,
            }}
          >
            <Pressable
              onPress={handleCreateDream}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 4,
              })}
              accessibilityRole="button"
              accessibilityLabel="Create new dream"
              accessibilityHint={canCreateDream ? "Opens dream creation flow" : "Opens upgrade screen"}
            >
              <IconSymbol name="plus" size={IconSize.lg} color={colors.onColor} weight="bold" />
            </Pressable>
            <UserAvatar />
          </View>
        </View>

        {/* Limit Warning Banner */}
        {showLimitWarning && (
          <Pressable
            onPress={() => {
              haptics.light();
              showUpgrade();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${dreamsRemaining === 1 ? "Last free dream remaining" : "1 free dream left"}. Try Premium free for 7 days`}
            accessibilityHint="Opens subscription screen"
            style={({ pressed }) => ({
              marginBottom: Spacing.lg,
              padding: Spacing.md,
              borderRadius: Radius.lg,
              backgroundColor: colors.surfaceTinted,
              borderWidth: 1,
              borderColor: colors.borderAccent,
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.sm,
              opacity: pressed ? Opacity.pressed : 1,
            })}
          >
            <IconSymbol name="sparkles" size={IconSize.lg} color={colors.accentBlue} />
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "600" }}
                color={colors.foreground}
              >
                {dreamsRemaining === 1 ? 'Last free dream!' : 'No free dreams left'}
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.sm }}
                color={colors.mutedForeground}
              >
                Try Premium free for 7 days
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
          </Pressable>
        )}

        {isLoading ? (
          <View style={{ gap: Spacing.xl }}>
            {/* Loading skeleton */}
            <SkeletonStatsCard />
            <SkeletonDreamCard />
            <SkeletonDreamCard />
            <SkeletonDreamCard />
          </View>
        ) : hasDreams ? (
          <View style={{ gap: Spacing.xl }}>
            {/* Progress card */}
            <ProgressSummaryCard
              progress={progress}
              dreamCount={dreams.length}
              colors={colors}
            />

            {/* Active categories with inline dreams */}
            {activeCategories.map((category) => (
              <CategorySection
                key={category}
                category={category}
                dreams={grouped[category]!}
                colors={colors}
              />
            ))}

            {/* Empty category chips */}
            {emptyCategories.length > 0 &&
              emptyCategories.length < DREAM_CATEGORY_LIST.length && (
                <EmptyCategoryCards
                  emptyCategories={emptyCategories}
                  colors={colors}
                />
              )}
          </View>
        ) : (
          <EmptyState colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}
