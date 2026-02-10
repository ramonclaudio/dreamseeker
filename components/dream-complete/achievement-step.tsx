import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  BounceIn,
} from "react-native-reanimated";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";
import { pickHype } from "@/constants/ui";
import type { ColorPalette } from "@/constants/theme";

export function AchievementStep({
  dreamTitle,
  category,
  categoryColor,
  completedActions,
  totalActions,
  createdAt,
  completedAt,
  colors,
}: {
  dreamTitle: string;
  category: DreamCategory;
  categoryColor: string;
  completedActions: number;
  totalActions: number;
  createdAt: number;
  completedAt: number;
  colors: ColorPalette;
}) {
  const categoryConfig = DREAM_CATEGORIES[category];
  const daysTaken = Math.ceil(
    ((completedAt ?? Date.now()) - createdAt) / (1000 * 60 * 60 * 24)
  );
  const hypeText = useMemo(() => pickHype('achievement'), []);

  return (
    <View style={styles.container}>
      {/* Trophy bounces in dramatically */}
      <Animated.View
        entering={BounceIn.duration(800).delay(200)}
        style={[
          styles.celebrationIcon,
          { backgroundColor: `${categoryColor}20` },
        ]}
      >
        <IconSymbol
          name="trophy.fill"
          size={IconSize["6xl"]}
          color={categoryColor}
        />
      </Animated.View>

      {/* Hype text zooms in */}
      <Animated.View entering={ZoomIn.springify().damping(10).stiffness(150).delay(500)}>
        <ThemedText style={styles.congratsText}>
          {hypeText}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(700)}>
        <ThemedText style={styles.congratsSubtitle} color={colors.mutedForeground}>
          This dream? DONE. You built this.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(900)}>
        <ThemedText variant="title" style={styles.dreamTitle}>
          {dreamTitle}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(300).delay(1100)} style={styles.categoryChip}>
        <IconSymbol
          name={CATEGORY_ICONS[category]}
          size={IconSize.lg}
          color={categoryColor}
        />
        <ThemedText style={{ fontSize: FontSize.base }} color={categoryColor}>
          {categoryConfig?.label}
        </ThemedText>
      </Animated.View>

      {/* Stats card slides up */}
      <Animated.View entering={FadeInDown.springify().damping(14).stiffness(120).delay(1300)} style={{ width: "100%" }}>
        <MaterialCard
          style={[
            styles.statsCard,
            { borderColor: colors.borderAccent },
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>
                {completedActions}
              </ThemedText>
              <ThemedText
                style={styles.statLabel}
                color={colors.mutedForeground}
              >
                Actions Smashed
              </ThemedText>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>
                {daysTaken}
              </ThemedText>
              <ThemedText
                style={styles.statLabel}
                color={colors.mutedForeground}
              >
                Days
              </ThemedText>
            </View>
          </View>
        </MaterialCard>
      </Animated.View>

      {/* XP badge bounces in last */}
      <Animated.View
        entering={BounceIn.duration(600).delay(1600)}
        style={[
          styles.xpBadge,
          { backgroundColor: colors.surfaceTinted, borderColor: colors.borderAccent },
        ]}
      >
        <IconSymbol name="bolt.fill" size={IconSize.xl} color={colors.gold} />
        <ThemedText style={styles.xpText}>+100 XP</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  congratsText: {
    fontSize: FontSize["6xl"],
    lineHeight: FontSize["6xl"] * 1.3,
    fontWeight: "800",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    maxWidth: "80%",
  },
  congratsSubtitle: {
    fontSize: FontSize.base,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  dreamTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    width: "100%",
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize["5xl"],
    fontWeight: "700",
  },
  statLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  xpText: {
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
});
