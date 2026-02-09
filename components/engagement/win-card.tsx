import { forwardRef } from "react";
import { View, StyleSheet } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { useColors } from "@/hooks/use-color-scheme";

type WinCardProps = {
  dreamTitle: string;
  category: DreamCategory;
  completedActions: number;
  totalActions: number;
  completedAt: number;
  handle?: string;
};

export const WinCard = forwardRef<View, WinCardProps>(function WinCard(
  { dreamTitle, category, completedActions, totalActions, completedAt, handle },
  ref
) {
  const colors = useColors();
  const categoryConfig = DREAM_CATEGORIES[category];
  const color = categoryConfig?.color ?? colors.primary;

  return (
    <View ref={ref} style={[styles.card, { backgroundColor: color }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol name="trophy.fill" size={IconSize["3xl"]} color={colors.onColor} />
        <ThemedText style={styles.headerText} color={colors.onColor}>
          Dream Achieved
        </ThemedText>
      </View>

      {/* Dream title */}
      <ThemedText style={styles.title} color={colors.onColor} numberOfLines={3}>
        {dreamTitle}
      </ThemedText>

      {/* Category */}
      <View style={styles.categoryRow}>
        <IconSymbol
          name={CATEGORY_ICONS[category]}
          size={IconSize.xl}
          color={colors.onColor}
        />
        <ThemedText style={styles.categoryText} color={colors.onColor}>
          {categoryConfig?.label ?? category}
        </ThemedText>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue} color={colors.onColor}>
            {completedActions}/{totalActions}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { opacity: 0.7 }]} color={colors.onColor}>
            Actions
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue} color={colors.onColor}>
            {new Date(completedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { opacity: 0.7 }]} color={colors.onColor}>
            Completed
          </ThemedText>
        </View>
      </View>

      {/* Branding */}
      <View style={styles.brandingContainer}>
        <ThemedText style={[styles.branding, { opacity: 0.7 }]} color={colors.onColor}>
          @{handle || 'dreamseeker'}
        </ThemedText>
        <ThemedText style={[styles.subBranding, { opacity: 0.4 }]} color={colors.onColor}>
          built with @packslight
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 400,
    borderRadius: Radius["2xl"],
    padding: Spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSize["6xl"],
    fontWeight: "700",
    lineHeight: 34,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSize.base,
    fontWeight: "500",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize["4xl"],
    fontWeight: "700",
  },
  statLabel: {
    fontSize: FontSize.sm,
  },
  divider: {
    width: 1,
    height: 40,
  },
  brandingContainer: {
    alignItems: "center",
    gap: 2,
  },
  branding: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    textAlign: "center",
  },
  subBranding: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    textAlign: "center",
  },
});
