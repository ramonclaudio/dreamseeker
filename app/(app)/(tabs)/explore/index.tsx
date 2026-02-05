import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useQuery, useConvexAuth } from "convex/react";
import { router } from "expo-router";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, MaxWidth, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { LEVELS, getLevelFromXp, getXpToNextLevel, DREAM_CATEGORIES, type DreamCategory } from "@/constants/dreams";
import { haptics } from "@/lib/haptics";

export default function DiscoverScreen() {
  const colors = useColors();
  const { isLoading: authLoading } = useConvexAuth();

  const progress = useQuery(api.progress.getProgress);
  const mindsetMoments = useQuery(api.mindset.list, {});
  const completedDreams = useQuery(api.dreams.listCompleted);
  const archivedDreams = useQuery(api.dreams.listArchived);

  if (authLoading || progress === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentLevel = getLevelFromXp(progress.totalXp);
  const xpProgress = getXpToNextLevel(progress.totalXp);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: Spacing["4xl"],
        paddingHorizontal: Spacing.xl,
        maxWidth: MaxWidth.content,
        alignSelf: "center",
        width: "100%",
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <View style={{ paddingVertical: Spacing.xl }}>
        <ThemedText variant="title">Discover</ThemedText>
        <ThemedText color={colors.mutedForeground}>
          Your progress and inspiration
        </ThemedText>
      </View>

      {/* Stats Overview */}
      <View
        style={{
          flexDirection: "row",
          gap: Spacing.md,
          marginBottom: Spacing.xl,
        }}
      >
        <MaterialCard
          style={{
            flex: 1,
            padding: Spacing.lg,
            alignItems: "center",
          }}
        >
          <IconSymbol name="trophy.fill" size={IconSize["3xl"]} color="#FFD700" />
          <ThemedText
            style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          >
            {progress.dreamsCompleted}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            Dreams Achieved
          </ThemedText>
        </MaterialCard>

        <MaterialCard
          style={{
            flex: 1,
            padding: Spacing.lg,
            alignItems: "center",
          }}
        >
          <IconSymbol name="checkmark.circle.fill" size={IconSize["3xl"]} color={colors.success} />
          <ThemedText
            style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          >
            {progress.actionsCompleted}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            Actions Done
          </ThemedText>
        </MaterialCard>
      </View>

      {/* Level Progress */}
      <View style={{ marginBottom: Spacing.xl }}>
        <ThemedText
          style={{
            fontSize: FontSize.base,
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: Spacing.sm,
            marginLeft: Spacing.xs,
          }}
          color={colors.mutedForeground}
        >
          Your Level
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: Spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ThemedText
                  style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}
                  color={colors.primaryForeground}
                >
                  {currentLevel.level}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={{ fontSize: FontSize.xl, fontWeight: "600" }}>
                  {currentLevel.title}
                </ThemedText>
                <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
                  {progress.totalXp} XP total
                </ThemedText>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <IconSymbol name="bolt.fill" size={IconSize.xl} color="#FFD700" />
              <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
                {xpProgress.needed > 0 ? `${xpProgress.needed - xpProgress.current} to next` : "Max level!"}
              </ThemedText>
            </View>
          </View>

          {/* Progress Bar */}
          {xpProgress.needed > 0 && (
            <View
              style={{
                height: 8,
                backgroundColor: colors.secondary,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${xpProgress.progress * 100}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          )}
        </MaterialCard>
      </View>

      {/* Streak Info */}
      <View style={{ marginBottom: Spacing.xl }}>
        <ThemedText
          style={{
            fontSize: FontSize.base,
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: Spacing.sm,
            marginLeft: Spacing.xs,
          }}
          color={colors.mutedForeground}
        >
          Streaks
        </ThemedText>
        <View style={{ flexDirection: "row", gap: Spacing.md }}>
          <MaterialCard
            style={{
              flex: 1,
              padding: Spacing.lg,
              alignItems: "center",
            }}
          >
            <IconSymbol name="flame.fill" size={IconSize["3xl"]} color="#FF6B35" />
            <ThemedText
              style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
            >
              {progress.currentStreak}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
              Current Streak
            </ThemedText>
          </MaterialCard>

          <MaterialCard
            style={{
              flex: 1,
              padding: Spacing.lg,
              alignItems: "center",
            }}
          >
            <IconSymbol name="star.fill" size={IconSize["3xl"]} color="#FFD700" />
            <ThemedText
              style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
            >
              {progress.longestStreak}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
              Longest Streak
            </ThemedText>
          </MaterialCard>
        </View>
      </View>

      {/* Level Journey */}
      <View style={{ marginBottom: Spacing.xl }}>
        <ThemedText
          style={{
            fontSize: FontSize.base,
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: Spacing.sm,
            marginLeft: Spacing.xs,
          }}
          color={colors.mutedForeground}
        >
          Level Journey
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          {LEVELS.map((level, index) => {
            const isUnlocked = progress.totalXp >= level.xp;
            const isCurrent = currentLevel.level === level.level;
            return (
              <View
                key={level.level}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.md,
                  paddingVertical: Spacing.sm,
                  opacity: isUnlocked ? 1 : 0.4,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isCurrent ? colors.primary : colors.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isCurrent ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  {isUnlocked ? (
                    <ThemedText
                      style={{ fontSize: FontSize.base, fontWeight: "600" }}
                      color={isCurrent ? colors.primaryForeground : colors.foreground}
                    >
                      {level.level}
                    </ThemedText>
                  ) : (
                    <IconSymbol name="lock.fill" size={IconSize.sm} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: FontSize.base, fontWeight: isCurrent ? "600" : "400" }}>
                    {level.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                    {level.xp} XP
                  </ThemedText>
                </View>
                {isCurrent && (
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xxs,
                      borderRadius: Radius.sm,
                    }}
                  >
                    <ThemedText
                      style={{ fontSize: FontSize.xs, fontWeight: "600" }}
                      color={colors.primaryForeground}
                    >
                      Current
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </MaterialCard>
      </View>

      {/* Completed Dreams */}
      {completedDreams && completedDreams.length > 0 && (
        <View style={{ marginBottom: Spacing.xl }}>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: Spacing.sm,
              marginLeft: Spacing.xs,
            }}
            color={colors.mutedForeground}
          >
            Completed Dreams ({completedDreams.length})
          </ThemedText>
          {completedDreams.map((dream: Doc<"dreams">) => {
            const categoryConfig = DREAM_CATEGORIES[dream.category as DreamCategory];
            return (
              <Pressable
                key={dream._id}
                onPress={() => {
                  haptics.selection();
                  router.push(`/(app)/dream/${dream._id}`);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  marginBottom: Spacing.sm,
                })}
              >
                <MaterialCard
                  style={{
                    padding: Spacing.lg,
                    borderLeftWidth: 4,
                    borderLeftColor: categoryConfig?.color ?? colors.success,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={IconSize.xl}
                      color={colors.success}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                        {dream.title}
                      </ThemedText>
                      {dream.completedAt && (
                        <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                          Completed {new Date(dream.completedAt).toLocaleDateString()}
                        </ThemedText>
                      )}
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={IconSize.lg}
                      color={colors.mutedForeground}
                    />
                  </View>
                </MaterialCard>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Archived Dreams */}
      {archivedDreams && archivedDreams.length > 0 && (
        <View style={{ marginBottom: Spacing.xl }}>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: Spacing.sm,
              marginLeft: Spacing.xs,
            }}
            color={colors.mutedForeground}
          >
            Archived Dreams ({archivedDreams.length})
          </ThemedText>
          {archivedDreams.map((dream: Doc<"dreams">) => {
            const categoryConfig = DREAM_CATEGORIES[dream.category as DreamCategory];
            return (
              <Pressable
                key={dream._id}
                onPress={() => {
                  haptics.selection();
                  router.push(`/(app)/dream/${dream._id}`);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  marginBottom: Spacing.sm,
                })}
              >
                <MaterialCard
                  style={{
                    padding: Spacing.lg,
                    borderLeftWidth: 4,
                    borderLeftColor: categoryConfig?.color ?? colors.mutedForeground,
                    opacity: 0.7,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                    <IconSymbol
                      name="trash.fill"
                      size={IconSize.xl}
                      color={colors.mutedForeground}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                        {dream.title}
                      </ThemedText>
                      <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                        Tap to restore
                      </ThemedText>
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={IconSize.lg}
                      color={colors.mutedForeground}
                    />
                  </View>
                </MaterialCard>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Mindset Moments */}
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
          >
            Mindset Moments
          </ThemedText>
          {mindsetMoments.slice(0, 5).map((moment: Doc<"mindsetMoments">) => (
            <MaterialCard
              key={moment._id}
              style={{
                padding: Spacing.lg,
                marginBottom: Spacing.sm,
              }}
            >
              <ThemedText
                style={{
                  fontSize: FontSize.base,
                  fontStyle: "italic",
                  lineHeight: 22,
                }}
              >
                {`"${moment.quote}"`}
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.sm, marginTop: Spacing.sm }}
                color={colors.mutedForeground}
              >
                — {moment.author}
              </ThemedText>
            </MaterialCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
