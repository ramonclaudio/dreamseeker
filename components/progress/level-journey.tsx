import { View, Pressable } from "react-native";
import { useState } from "react";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { LEVELS } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";

type NodeState = "completed" | "current" | "locked";

const NODE_SIZE = { completed: 26, current: 34, locked: 26 };
const OUTER_RING = 8;
const LINE_WIDTH = 2.5;
const COLUMN_WIDTH = 52;

// Window: 1 completed before current + current + 2 upcoming
const CONTEXT_BEFORE = 1;
const CONTEXT_AFTER = 2;

function getNodeState(levelNum: number, currentLevel: number): NodeState {
  if (levelNum < currentLevel) return "completed";
  if (levelNum === currentLevel) return "current";
  return "locked";
}

function TimelineNode({
  state,
  levelNum,
  colors,
}: {
  state: NodeState;
  levelNum: number;
  colors: ColorPalette;
}) {
  const size = NODE_SIZE[state];

  if (state === "completed") {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconSymbol name="checkmark" size={12} color={colors.onColor} />
      </View>
    );
  }

  if (state === "current") {
    return (
      <View
        style={{
          width: size + OUTER_RING,
          height: size + OUTER_RING,
          borderRadius: (size + OUTER_RING) / 2,
          borderWidth: 2,
          borderColor: colors.borderAccentStrong,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            style={{ fontSize: FontSize.lg, fontWeight: "700" }}
            color={colors.onColor}
          >
            {levelNum}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.secondary,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconSymbol name="lock.fill" size={11} color={colors.mutedForeground} />
    </View>
  );
}

function TimelineRow({
  level,
  state,
  isFirst,
  isLast,
  currentLevel,
  colors,
}: {
  level: (typeof LEVELS)[number];
  state: NodeState;
  isFirst: boolean;
  isLast: boolean;
  currentLevel: number;
  colors: ColorPalette;
}) {
  // Line above: accent if this level is completed or current
  const aboveColor = level.level <= currentLevel ? colors.primary : colors.border;
  // Line below: accent only if this level is completed (next is still on the path)
  const belowColor = level.level < currentLevel ? colors.primary : colors.border;

  return (
    <View style={{ flexDirection: "row", minHeight: state === "current" ? 58 : 46 }}>
      {/* Timeline column */}
      <View style={{ width: COLUMN_WIDTH, alignItems: "center" }}>
        <View
          style={{
            width: LINE_WIDTH,
            flex: 1,
            backgroundColor: isFirst ? "transparent" : aboveColor,
          }}
        />
        <TimelineNode state={state} levelNum={level.level} colors={colors} />
        <View
          style={{
            width: LINE_WIDTH,
            flex: 1,
            backgroundColor: isLast ? "transparent" : belowColor,
          }}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: "center", paddingLeft: Spacing.sm }}>
        <ThemedText
          style={{
            fontSize: state === "current" ? FontSize.xl : FontSize.base,
            fontWeight: state === "current" ? "700" : state === "completed" ? "500" : "400",
          }}
          color={state === "locked" ? colors.mutedForeground : colors.foreground}
        >
          {level.title}
        </ThemedText>
        <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
          {level.xp === 0 ? "Starting level" : `${level.xp.toLocaleString()} XP`}
        </ThemedText>
      </View>
    </View>
  );
}

export function LevelJourney({
  totalXp,
  currentLevel,
  colors,
}: {
  totalXp: number;
  currentLevel: number;
  colors: ColorPalette;
}) {
  const [expanded, setExpanded] = useState(false);

  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel);
  const windowStart = Math.max(0, currentIndex - CONTEXT_BEFORE);
  const windowEnd = Math.min(LEVELS.length, currentIndex + CONTEXT_AFTER + 1);
  const windowedLevels = LEVELS.slice(windowStart, windowEnd);
  const hiddenCount = LEVELS.length - windowedLevels.length;

  const visibleLevels = expanded ? [...LEVELS] : [...windowedLevels];

  return (
    <View style={{ marginTop: Spacing.lg, marginBottom: Spacing.lg }}>
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
      <MaterialCard style={{ paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm }}>
        {visibleLevels.map((level, index) => {
          const state = getNodeState(level.level, currentLevel);
          return (
            <TimelineRow
              key={level.level}
              level={level}
              state={state}
              isFirst={index === 0}
              isLast={index === visibleLevels.length - 1}
              currentLevel={currentLevel}
              colors={colors}
            />
          );
        })}

        {hiddenCount > 0 && (
          <Pressable
            onPress={() => setExpanded((prev) => !prev)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.xs,
              paddingTop: Spacing.md,
              opacity: pressed ? Opacity.pressed : 1,
            })}
          >
            <ThemedText
              style={{ fontSize: FontSize.sm, fontWeight: "500" }}
              color={colors.primary}
            >
              {expanded ? "Show less" : `Show all ${LEVELS.length} levels`}
            </ThemedText>
            <IconSymbol
              name={expanded ? "chevron.up" : "chevron.down"}
              size={IconSize.sm}
              color={colors.primary}
            />
          </Pressable>
        )}
      </MaterialCard>
    </View>
  );
}
