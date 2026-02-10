import { memo } from "react";
import { View, Pressable } from "react-native";

import { GradientProgressBar } from "@/components/ui/gradient-progress-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";

// ── Types ────────────────────────────────────────────────────────────────────

type ProgressData = {
  level: number;
  levelTitle: string;
  xpProgress: number;
  xpToNextLevel: number;
  currentStreak: number;
  actionsCompleted: number;
};

// ── Progress Summary — compact inline strip ─────────────────────────────────

export const ProgressSummaryCard = memo(function ProgressSummaryCard({
  progress,
  dreamCount,
  colors,
  onLevelPress,
}: {
  progress: ProgressData;
  dreamCount: number;
  colors: ColorPalette;
  onLevelPress?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
      }}
    >
      {/* Level chip */}
      <Pressable onPress={onLevelPress} disabled={!onLevelPress} hitSlop={8}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.xs,
            backgroundColor: colors.surfaceTinted,
            borderRadius: 20,
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.md,
          }}
        >
          <IconSymbol name="bolt.fill" size={IconSize.sm} color={colors.gold} />
          <ThemedText
            style={{ fontSize: FontSize.sm, fontWeight: "700" }}
            color={colors.foreground}
          >
            Lv.{progress.level}
          </ThemedText>
        </View>
      </Pressable>

      {/* XP bar */}
      <View style={{ flex: 1 }}>
        <GradientProgressBar progress={progress.xpProgress} height={4} />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <IconSymbol name="sparkles" size={IconSize.sm} color={colors.primary} />
          <ThemedText
            style={{ fontSize: FontSize.sm, fontWeight: "600" }}
            color={colors.foreground}
          >
            {dreamCount}
          </ThemedText>
        </View>
        {progress.currentStreak > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <IconSymbol name="flame.fill" size={IconSize.sm} color={colors.gold} />
            <ThemedText
              style={{ fontSize: FontSize.sm, fontWeight: "600" }}
              color={colors.foreground}
            >
              {progress.currentStreak}d
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
});
