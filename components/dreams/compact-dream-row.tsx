import { memo } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import type { Doc } from "@/convex/_generated/dataModel";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { type ColorPalette, Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { getCategoryConfig, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";

// ── Types ────────────────────────────────────────────────────────────────────

export type DreamWithCounts = Doc<"dreams"> & {
  completedActions: number;
  totalActions: number;
};

// ── Status Strip Config ─────────────────────────────────────────────────────

function getStripConfig(
  dream: DreamWithCounts,
  categoryLabel: string,
  colors: ColorPalette,
) {
  if (dream.status === "completed") {
    return { color: colors.success, label: "Done" };
  }
  if (dream.status === "archived") {
    return { color: colors.mutedForeground, label: "Paused" };
  }
  return { color: colors.primary, label: categoryLabel };
}

// ── Vertical Label ──────────────────────────────────────────────────────────

function VerticalLabel({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThemedText
        style={{
          transform: [{ rotate: "-90deg" }],
          width: 120,
          textAlign: "center",
          fontSize: FontSize.xs,
          fontWeight: "800",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
        numberOfLines={1}
        color={color}
      >
        {label}
      </ThemedText>
    </View>
  );
}

// ── Dream Card ──────────────────────────────────────────────────────────────

const STRIP_WIDTH = 44;

export const CompactDreamRow = memo(function CompactDreamRow({
  dream,
  colors,
  onComplete,
  onEdit,
  onArchive,
}: {
  dream: DreamWithCounts;
  colors: ColorPalette;
  onComplete?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
}) {
  const config = getCategoryConfig(dream);
  const hasSteps = dream.totalActions > 0;
  const progress = hasSteps ? dream.completedActions / dream.totalActions : 0;
  const pct = Math.round(progress * 100);
  const stepsLabel = hasSteps
    ? `${dream.completedActions}/${dream.totalActions} steps`
    : "No steps yet";

  const targetLabel = dream.targetDate
    ? new Date(dream.targetDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const catIcon = CATEGORY_ICONS[dream.category as DreamCategory] ?? "star.fill";
  const strip = getStripConfig(dream, config.label, colors);
  const isActive = dream.status === "active";

  return (
    <SwipeableRow
      onComplete={isActive ? onComplete : undefined}
      onEdit={onEdit}
      onDelete={isActive ? onArchive : undefined}
      completeColor={colors.success}
      editColor={colors.accent}
      deleteColor={colors.mutedForeground}
      deleteLabel="Archive"
      deleteIcon="archivebox"
      enabled={isActive}
    >
      <Pressable
        onPress={() => router.push(`/(app)/dream/${dream._id}`)}
        style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
        accessibilityRole="button"
        accessibilityLabel={`${dream.title}, ${stepsLabel}`}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: Radius.lg,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.borderAccent,
            overflow: "hidden",
            shadowColor: colors.glowShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          {/* Content */}
          <View style={{ flex: 1, padding: Spacing.lg, gap: Spacing.sm }}>
            {/* Title row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  borderCurve: "continuous",
                  backgroundColor: `${config.color}18`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol
                  name={catIcon as never}
                  size={IconSize.md}
                  color={config.color}
                />
              </View>
              <ThemedText
                style={{
                  fontSize: FontSize.xl,
                  fontWeight: "700",
                  flex: 1,
                  letterSpacing: -0.3,
                }}
                color={colors.foreground}
                numberOfLines={2}
              >
                {dream.title}
              </ThemedText>
            </View>

            {/* Meta row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.xs,
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

            {/* Progress bar */}
            {hasSteps && dream.status !== "completed" && (
              <View
                style={{
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: `${config.color}15`,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    backgroundColor: config.color,
                  }}
                />
              </View>
            )}
          </View>

          {/* Status strip */}
          <View
            style={{
              width: STRIP_WIDTH,
              backgroundColor: config.color,
            }}
          >
            <VerticalLabel label={strip.label} color="#fff" />
          </View>
        </View>
      </Pressable>
    </SwipeableRow>
  );
});
