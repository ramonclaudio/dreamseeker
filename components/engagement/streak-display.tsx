import { View } from "react-native";

import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { STREAK_MILESTONES } from "@/convex/constants";

const MILESTONE_ICONS: Record<number, IconSymbolName> = {
  1: "star.fill",
  3: "bolt.fill",
  5: "flame.fill",
  10: "diamond.fill",
  30: "crown.fill",
};

type StreakDisplayProps = {
  currentStreak: number;
  milestones?: number[];
};

export function StreakDisplay({ currentStreak, milestones = [] }: StreakDisplayProps) {
  const colors = useColors();

  return (
    <MaterialCard
      style={{
        padding: Spacing.lg,
        backgroundColor: colors.surfaceTinted,
        borderWidth: 1,
        borderColor: colors.borderAccent,
      }}
    >
      {/* Streak header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.sm,
          marginBottom: Spacing.md,
        }}
      >
        <IconSymbol name="flame.fill" size={IconSize["3xl"]} color={colors.primary} />
        <ThemedText style={{ fontSize: FontSize["5xl"], fontWeight: "700" }}>
          {currentStreak}
        </ThemedText>
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: "500" }}
          color={colors.mutedForeground}
        >
          day streak
        </ThemedText>
      </View>

      {/* Milestone row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        accessible={true}
        accessibilityLabel={`Streak milestones: ${STREAK_MILESTONES.map((v) => {
          const achieved = milestones.includes(v) || currentStreak >= v;
          return `${v} days ${achieved ? "achieved" : "not achieved"}`;
        }).join(", ")}`}
      >
        {STREAK_MILESTONES.map((value) => {
          const achieved = milestones.includes(value) || currentStreak >= value;
          const iconName = MILESTONE_ICONS[value];

          return (
            <View key={value} style={{ alignItems: "center", gap: Spacing.xs }} importantForAccessibility="no-hide-descendants">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: achieved ? colors.accentBlue : "transparent",
                  borderWidth: achieved ? 0 : 2,
                  borderColor: colors.mutedForeground,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol
                  name={iconName}
                  size={IconSize.lg}
                  color={achieved ? colors.onColor : colors.mutedForeground}
                />
              </View>
              <ThemedText
                style={{ fontSize: FontSize.xs, fontWeight: "600" }}
                color={achieved ? colors.accentBlue : colors.mutedForeground}
              >
                {value}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </MaterialCard>
  );
}
