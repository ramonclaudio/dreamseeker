import { View, StyleSheet } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";
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

  return (
    <View style={styles.container}>
      <View
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
      </View>

      <ThemedText style={styles.congratsText}>
        Look at you!
      </ThemedText>

      <ThemedText variant="title" style={styles.dreamTitle}>
        {dreamTitle}
      </ThemedText>

      <View style={styles.categoryChip}>
        <IconSymbol
          name={CATEGORY_ICONS[category]}
          size={IconSize.lg}
          color={categoryColor}
        />
        <ThemedText style={{ fontSize: FontSize.base }} color={categoryColor}>
          {categoryConfig?.label}
        </ThemedText>
      </View>

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
              Actions Crushed
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

      <View
        style={[
          styles.xpBadge,
          { backgroundColor: colors.surfaceTinted, borderColor: colors.borderAccent },
        ]}
      >
        <IconSymbol name="bolt.fill" size={IconSize.xl} color={colors.gold} />
        <ThemedText style={styles.xpText}>+100 XP</ThemedText>
      </View>
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
    marginBottom: Spacing.xl,
  },
  congratsText: {
    fontSize: FontSize["5xl"],
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  dreamTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
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
