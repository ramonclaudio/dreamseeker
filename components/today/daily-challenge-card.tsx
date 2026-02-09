import { View, Pressable } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function DailyChallengeCard({
  title,
  description,
  xpReward,
  isCompleted,
  onComplete,
  colors,
}: {
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
  colors: ColorPalette;
}) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
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
                {title}
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
                color={colors.gold}
              />
              <ThemedText
                style={{ fontSize: FontSize.sm, fontWeight: "600" }}
              >
                +{xpReward} XP
              </ThemedText>
            </View>
          </View>
          <ThemedText
            style={{ fontSize: FontSize.base, lineHeight: 22 }}
            color={colors.mutedForeground}
          >
            {description}
          </ThemedText>
        </View>
        <Pressable
          onPress={onComplete}
          disabled={isCompleted}
          style={({ pressed }) => ({
            backgroundColor: isCompleted
              ? colors.success
              : colors.accentBlue,
            padding: Spacing.lg,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={
            isCompleted
              ? "Challenge completed"
              : "Complete challenge"
          }
        >
          <ThemedText
            style={{ fontSize: FontSize.base, fontWeight: "600" }}
            color={
              isCompleted
                ? colors.successForeground
                : colors.onColor
            }
          >
            {isCompleted
              ? "Completed!"
              : "Mark as Complete"}
          </ThemedText>
        </Pressable>
      </MaterialCard>
    </View>
  );
}
