import { memo, useCallback } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";

import { api } from "@/convex/_generated/api";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, MaxWidth, IconSize } from "@/constants/layout";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type PendingAction = {
  _id: string;
  text: string;
  dreamTitle: string;
  dreamCategory?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  travel: "#E91E8C",
  money: "#FFD700",
  career: "#FF6B6B",
  lifestyle: "#4ECDC4",
  growth: "#95E1D3",
  relationships: "#F38181",
};

const ActionItem = memo(function ActionItem({
  action,
  onToggle,
  colors,
}: {
  action: PendingAction;
  onToggle: () => void;
  colors: ColorPalette;
}) {
  const categoryColor = action.dreamCategory
    ? CATEGORY_COLORS[action.dreamCategory] ?? colors.primary
    : colors.primary;

  return (
    <MaterialCard style={{ marginBottom: Spacing.sm }}>
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: Spacing.lg,
          minHeight: TouchTarget.min,
          gap: Spacing.md,
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        accessibilityLabel={`${action.text}, for dream: ${action.dreamTitle}`}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: categoryColor,
          }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: FontSize.xl }} numberOfLines={2}>
            {action.text}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
            color={colors.mutedForeground}
          >
            {action.dreamTitle}
          </ThemedText>
        </View>
      </Pressable>
    </MaterialCard>
  );
});

export default function TodayScreen() {
  const colors = useColors();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const progress = useQuery(api.progress.getProgress);
  const dailyChallenge = useQuery(api.challenges.getDaily);
  const mindsetMoment = useQuery(api.mindset.getRandom, {});
  const pendingActions = useQuery(
    api.actions.listPending,
    isAuthenticated ? {} : "skip"
  );

  const toggleAction = useMutation(api.actions.toggle);
  const completeChallenge = useMutation(api.challenges.complete);

  const handleToggleAction = useCallback(
    async (id: string) => {
      haptics.success();
      await toggleAction({ id: id as any });
    },
    [toggleAction]
  );

  const handleCompleteChallenge = useCallback(async () => {
    if (!dailyChallenge || dailyChallenge.isCompleted) return;
    haptics.success();
    shootConfetti();
    await completeChallenge({ challengeId: dailyChallenge._id });
  }, [completeChallenge, dailyChallenge]);

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
      {/* Greeting & Streak */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: Spacing.xl,
        }}
      >
        <View>
          <ThemedText variant="title">Today</ThemedText>
          <ThemedText color={colors.mutedForeground}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </ThemedText>
        </View>
        {progress.currentStreak > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.secondary,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.full,
              gap: Spacing.xs,
            }}
          >
            <IconSymbol name="flame.fill" size={IconSize.lg} color="#FF6B35" />
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }}>
              {progress.currentStreak}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Mindset Moment */}
      {mindsetMoment && (
        <MaterialCard
          style={{
            padding: Spacing.xl,
            marginBottom: Spacing.xl,
            backgroundColor: colors.secondary,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: Spacing.md,
            }}
          >
            <IconSymbol
              name="quote.bubble.fill"
              size={IconSize["2xl"]}
              color={colors.mutedForeground}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: FontSize["2xl"],
                  fontStyle: "italic",
                  lineHeight: 26,
                }}
              >
                {`"${mindsetMoment.quote}"`}
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.base, marginTop: Spacing.sm }}
                color={colors.mutedForeground}
              >
                — {mindsetMoment.author}
              </ThemedText>
            </View>
          </View>
        </MaterialCard>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
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
            Daily Challenge
          </ThemedText>
          <MaterialCard style={{ overflow: "hidden" }}>
            <View style={{ padding: Spacing.lg }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: Spacing.sm,
                }}
              >
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <ThemedText
                    style={{ fontSize: FontSize.xl, fontWeight: "600" }}
                  >
                    {dailyChallenge.title}
                  </ThemedText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.secondary,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xxs,
                    borderRadius: Radius.sm,
                    gap: Spacing.xxs,
                  }}
                >
                  <IconSymbol
                    name="bolt.fill"
                    size={IconSize.sm}
                    color="#FFD700"
                  />
                  <ThemedText
                    style={{ fontSize: FontSize.sm, fontWeight: "600" }}
                  >
                    +{dailyChallenge.xpReward} XP
                  </ThemedText>
                </View>
              </View>
              <ThemedText
                style={{ fontSize: FontSize.base, lineHeight: 22 }}
                color={colors.mutedForeground}
              >
                {dailyChallenge.description}
              </ThemedText>
            </View>
            <Pressable
              onPress={handleCompleteChallenge}
              disabled={dailyChallenge.isCompleted}
              style={({ pressed }) => ({
                backgroundColor: dailyChallenge.isCompleted
                  ? colors.success
                  : colors.primary,
                padding: Spacing.lg,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel={
                dailyChallenge.isCompleted
                  ? "Challenge completed"
                  : "Complete challenge"
              }
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "600" }}
                color={
                  dailyChallenge.isCompleted
                    ? colors.successForeground
                    : colors.primaryForeground
                }
              >
                {dailyChallenge.isCompleted
                  ? "Completed!"
                  : "Mark as Complete"}
              </ThemedText>
            </Pressable>
          </MaterialCard>
        </View>
      )}

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
          >
            Pending Actions
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            {pendingActions?.length ?? 0} remaining
          </ThemedText>
        </View>

        {pendingActions && pendingActions.length > 0 ? (
          pendingActions.map((action: PendingAction) => (
            <ActionItem
              key={action._id}
              action={action as PendingAction}
              colors={colors}
              onToggle={() => handleToggleAction(action._id)}
            />
          ))
        ) : (
          <MaterialCard style={{ padding: Spacing.xl, alignItems: "center" }}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={IconSize["4xl"]}
              color={colors.success}
            />
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                marginTop: Spacing.md,
                textAlign: "center",
              }}
              color={colors.mutedForeground}
            >
              All caught up! Add actions to your dreams.
            </ThemedText>
          </MaterialCard>
        )}
      </View>
    </ScrollView>
  );
}
