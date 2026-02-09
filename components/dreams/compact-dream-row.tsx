import { memo } from "react";
import { View, Pressable } from "react-native";
import { Link } from "expo-router";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import type { Doc } from "@/convex/_generated/dataModel";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette, Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { getCategoryConfig } from "@/constants/dreams";

// ── Types ────────────────────────────────────────────────────────────────────

export type DreamWithCounts = Doc<"dreams"> & {
  completedActions: number;
  totalActions: number;
};

// ── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 36,
  strokeWidth = 3,
  color,
  trackColor,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - filled);
  const center = size / 2;
  const pct = Math.round(filled * 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <ThemedText
        style={{ fontSize: 10, fontWeight: "700" }}
        color={color}
      >
        {pct}
      </ThemedText>
    </View>
  );
}

// ── Compact Dream Row ────────────────────────────────────────────────────────

export const CompactDreamRow = memo(function CompactDreamRow({
  dream,
  colors,
}: {
  dream: DreamWithCounts;
  colors: ColorPalette;
}) {
  const config = getCategoryConfig(dream);
  const hasSteps = dream.totalActions > 0;
  const progress = hasSteps ? dream.completedActions / dream.totalActions : 0;
  const stepsLabel = hasSteps
    ? `${dream.completedActions}/${dream.totalActions} steps`
    : "Add steps";

  const targetLabel = dream.targetDate
    ? new Date(dream.targetDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/(app)/dream/${dream._id}`} asChild>
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
        accessibilityRole="button"
        accessibilityLabel={`${dream.title}, ${stepsLabel}`}
      >
        <MaterialCard variant="tinted">
          <View style={{ flexDirection: "row" }}>
            {/* Category color accent bar */}
            <View
              style={{
                width: 4,
                backgroundColor: config.color,
                borderTopLeftRadius: Radius.lg,
                borderBottomLeftRadius: Radius.lg,
              }}
            />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: Spacing.md,
                paddingLeft: Spacing.md,
                paddingRight: Spacing.md,
                gap: Spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{ fontSize: FontSize.xl, fontWeight: "600" }}
                  color={colors.foreground}
                  numberOfLines={1}
                >
                  {dream.title}
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.xs,
                    marginTop: 2,
                  }}
                >
                  <ThemedText
                    style={{ fontSize: FontSize.sm }}
                    color={colors.mutedForeground}
                  >
                    {stepsLabel}
                  </ThemedText>
                  {targetLabel && (
                    <ThemedText
                      style={{ fontSize: FontSize.sm }}
                      color={colors.mutedForeground}
                    >
                      · {targetLabel}
                    </ThemedText>
                  )}
                </View>
              </View>
              {hasSteps ? (
                <ProgressRing
                  progress={progress}
                  size={34}
                  strokeWidth={3}
                  color={config.color}
                  trackColor={`${config.color}20`}
                />
              ) : (
                <IconSymbol
                  name="chevron.right"
                  size={IconSize.md}
                  color={colors.mutedForeground}
                />
              )}
            </View>
          </View>
        </MaterialCard>
      </Pressable>
    </Link>
  );
});
