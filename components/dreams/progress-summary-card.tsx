import { memo } from "react";
import { View, Pressable } from "react-native";
import { Link } from "expo-router";

import { GradientProgressBar } from "@/components/ui/gradient-progress-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";

// ── Types ────────────────────────────────────────────────────────────────────

type ProgressData = {
  level: number;
  levelTitle: string;
  xpProgress: number;
  xpToNextLevel: number;
  currentStreak: number;
  actionsCompleted: number;
};

// ── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  value,
  colors,
  accentColor,
}: {
  icon: string;
  label: string;
  value: string | number;
  colors: ColorPalette;
  accentColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: colors.surfaceTinted,
        borderRadius: 8,
        borderCurve: "continuous",
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
      }}
    >
      <IconSymbol
        name={icon as never}
        size={IconSize.sm}
        color={accentColor ?? colors.accentBlue}
      />
      <View>
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: "700", lineHeight: 16 }}
          color={colors.foreground}
        >
          {value}
        </ThemedText>
        <ThemedText
          style={{ fontSize: 10, lineHeight: 12 }}
          color={colors.mutedForeground}
        >
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

// ── Progress Summary Card ────────────────────────────────────────────────────

export const ProgressSummaryCard = memo(function ProgressSummaryCard({
  progress,
  dreamCount,
  colors,
}: {
  progress: ProgressData;
  dreamCount: number;
  colors: ColorPalette;
}) {
  return (
    <Link href="/(app)/(tabs)/today" asChild>
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
        accessibilityRole="button"
        accessibilityLabel={`Level ${progress.level} ${progress.levelTitle}`}
      >
        <MaterialCard
          style={{
            padding: Spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: colors.accentBlue,
          }}
        >
          {/* Level + XP */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: Spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ fontSize: FontSize["3xl"], fontWeight: "700", letterSpacing: -0.3 }}
                color={colors.foreground}
              >
                Lv.{progress.level}
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.sm, marginTop: 1 }}
                color={colors.mutedForeground}
              >
                {progress.levelTitle} · {progress.xpToNextLevel > 0 ? `${progress.xpToNextLevel} XP to next` : "Max level"}
              </ThemedText>
            </View>
            <IconSymbol
              name="chevron.right"
              size={IconSize.md}
              color={colors.mutedForeground}
            />
          </View>

          <GradientProgressBar
            progress={progress.xpProgress}
            height={5}
            style={{ marginBottom: Spacing.lg }}
          />

          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <StatChip
              icon="sparkles"
              value={dreamCount}
              label="Dreams"
              colors={colors}
            />
            <StatChip
              icon="checkmark.circle.fill"
              value={progress.actionsCompleted}
              label="Done"
              colors={colors}
            />
            <StatChip
              icon="flame.fill"
              value={`${progress.currentStreak}d`}
              label="Streak"
              colors={colors}
              accentColor={colors.gold}
            />
          </View>
        </MaterialCard>
      </Pressable>
    </Link>
  );
});
