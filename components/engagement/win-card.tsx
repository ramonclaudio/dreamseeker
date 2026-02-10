import { forwardRef } from "react";
import { View, StyleSheet } from "react-native";

import { SvgGradientBg } from "@/components/ui/svg-gradient-bg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";

// Warm brand gradients per category
export const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  travel: ['#E8A87C', '#C17F59'],
  money: ['#FFD700', '#c4a84c'],
  career: ['#FF8C42', '#E8A87C'],
  lifestyle: ['#D4956B', '#C17F59'],
  growth: ['#4CAF50', '#00897B'],
  relationships: ['#e8a0b0', '#d4708a'],
  custom: ['#FF8C42', '#D4956B'],
};

// Bolder gradients for journey cards (deeper bottom stops)
const JOURNEY_GRADIENTS: Record<string, [string, string]> = {
  travel: ['#FF9966', '#7D3C1F'],
  money: ['#FFD700', '#B8860B'],
  career: ['#FF8C42', '#CC4400'],
  lifestyle: ['#E8734C', '#8B1A1A'],
  growth: ['#4CAF50', '#1B5E20'],
  relationships: ['#FF99AA', '#8B1538'],
  custom: ['#FF8C42', '#CC4400'],
};

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
  const categoryConfig = DREAM_CATEGORIES[category];
  const gradient = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.custom;

  return (
    <View ref={ref} style={styles.card}>
      <SvgGradientBg colors={gradient} width={300} height={400} direction="diagonal" />
      <View style={styles.glassOverlay} />
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol name="trophy.fill" size={IconSize["3xl"]} color="#FFD700" />
        <ThemedText style={styles.headerText} color="#fff">
          Dream Achieved
        </ThemedText>
      </View>

      {/* Dream title */}
      <ThemedText style={styles.title} color="#fff" numberOfLines={3}>
        {dreamTitle}
      </ThemedText>

      {/* Category */}
      <View style={styles.categoryRow}>
        <IconSymbol
          name={CATEGORY_ICONS[category]}
          size={IconSize.xl}
          color="#fff"
        />
        <ThemedText style={styles.categoryText} color="#fff">
          {categoryConfig?.label ?? category}
        </ThemedText>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue} color="#fff">
            {completedActions}/{totalActions}
          </ThemedText>
          <ThemedText style={styles.statLabel} color="rgba(255,255,255,0.7)">
            Actions
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue} color="#fff">
            {new Date(completedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </ThemedText>
          <ThemedText style={styles.statLabel} color="rgba(255,255,255,0.7)">
            Completed
          </ThemedText>
        </View>
      </View>

      {/* Branding */}
      <View style={styles.brandingContainer}>
        <ThemedText style={styles.branding} color="rgba(255,255,255,0.7)">
          @{handle || 'dreamseeker'}
        </ThemedText>
        <ThemedText style={styles.subBranding} color="rgba(255,255,255,0.4)">
          DreamSeeker · @packslight
        </ThemedText>
      </View>
    </View>
  );
});

// --- Journey Card (story-sized, 390x700 on device -> 1080x1920 for sharing) ---

type JourneyAction = {
  text: string;
  isCompleted: boolean;
};

type JourneyCardProps = {
  dreamTitle: string;
  category: DreamCategory;
  actions: JourneyAction[];
  createdAt: number;
  completedAt: number;
  totalXp?: number;
  handle?: string;
};

export const JourneyCard = forwardRef<View, JourneyCardProps>(function JourneyCard(
  { dreamTitle, category, actions, createdAt, completedAt, totalXp, handle },
  ref
) {
  const categoryConfig = DREAM_CATEGORIES[category];
  const gradient = JOURNEY_GRADIENTS[category] ?? JOURNEY_GRADIENTS.custom;
  const daysCount = Math.max(1, Math.ceil((completedAt - createdAt) / (1000 * 60 * 60 * 24)));
  const visibleActions = actions.slice(0, 10);
  const hasMore = actions.length > 10;

  return (
    <View ref={ref} style={journeyStyles.card}>
      <SvgGradientBg colors={gradient} width={390} height={700} direction="diagonal" />
      <View style={journeyStyles.glassOverlay} />

      {/* Radial glow near trophy */}
      <View style={journeyStyles.radialGlow} />

      {/* Decorative sparkles */}
      <View style={journeyStyles.topRightSparkle}>
        <IconSymbol name="sparkles" size={IconSize['3xl']} color="rgba(255,215,0,0.25)" />
      </View>
      <View style={journeyStyles.topLeftSparkle}>
        <IconSymbol name="sparkles" size={IconSize.xl} color="rgba(255,255,255,0.15)" />
      </View>
      <View style={journeyStyles.bottomLeftSparkle}>
        <IconSymbol name="sparkles" size={IconSize['2xl']} color="rgba(255,215,0,0.2)" />
      </View>

      {/* Header */}
      <View style={journeyStyles.headerSection}>
        <View style={journeyStyles.headerRow}>
          <IconSymbol name="trophy.fill" size={IconSize["5xl"]} color="#FFD700" />
          <ThemedText style={journeyStyles.headerText} color="#fff">
            DREAM ACHIEVED
          </ThemedText>
        </View>

        <ThemedText style={journeyStyles.title} color="#fff" numberOfLines={3}>
          {dreamTitle}
        </ThemedText>

        <View style={journeyStyles.categoryBadge}>
          <IconSymbol
            name={CATEGORY_ICONS[category]}
            size={IconSize.xl}
            color="#fff"
          />
          <ThemedText style={journeyStyles.categoryText} color="#fff">
            {categoryConfig?.label ?? category}
          </ThemedText>
        </View>
      </View>

      {/* Timeline */}
      <View style={journeyStyles.timeline}>
        {visibleActions.map((action, i) => (
          <View key={i} style={journeyStyles.timelineItem}>
            {i < visibleActions.length - 1 && (
              <View style={journeyStyles.timelineLine} />
            )}
            <View
              style={[
                journeyStyles.timelineDot,
                action.isCompleted
                  ? journeyStyles.timelineDotCompleted
                  : journeyStyles.timelineDotIncomplete,
              ]}
            >
              {action.isCompleted && (
                <IconSymbol name="checkmark" size={14} color={gradient[1]} />
              )}
            </View>
            <ThemedText
              style={journeyStyles.timelineText}
              color="#fff"
              numberOfLines={1}
            >
              {action.text}
            </ThemedText>
          </View>
        ))}
        {hasMore && (
          <ThemedText style={journeyStyles.moreText} color="rgba(255,255,255,0.7)">
            +{actions.length - 10} more actions
          </ThemedText>
        )}
      </View>

      {/* Stats row */}
      <View style={journeyStyles.statsRow}>
        <View style={journeyStyles.statPill}>
          <ThemedText style={journeyStyles.statValue} color="#fff">
            {daysCount}
          </ThemedText>
          <ThemedText style={journeyStyles.statLabel} color="rgba(255,255,255,0.85)">
            {daysCount === 1 ? 'day' : 'days'}
          </ThemedText>
        </View>
        <View style={journeyStyles.statPill}>
          <ThemedText style={journeyStyles.statValue} color="#fff">
            {actions.filter((a) => a.isCompleted).length}
          </ThemedText>
          <ThemedText style={journeyStyles.statLabel} color="rgba(255,255,255,0.85)">
            actions
          </ThemedText>
        </View>
        {totalXp != null && (
          <View style={journeyStyles.statPill}>
            <ThemedText style={journeyStyles.statValue} color="#fff">
              {totalXp}
            </ThemedText>
            <ThemedText style={journeyStyles.statLabel} color="rgba(255,255,255,0.85)">
              XP
            </ThemedText>
          </View>
        )}
      </View>

      {/* Branding */}
      <View style={journeyStyles.brandingSection}>
        <ThemedText style={journeyStyles.handle} color="rgba(255,255,255,0.9)">
          @{handle || 'dreamseeker'}
        </ThemedText>
        <View style={journeyStyles.brandRow}>
          <ThemedText style={journeyStyles.brandName} color="rgba(255,255,255,0.7)">
            DreamSeeker
          </ThemedText>
          <View style={journeyStyles.brandDot} />
          <ThemedText style={journeyStyles.brandCreator} color="rgba(255,255,255,0.6)">
            @packslight
          </ThemedText>
        </View>
        <ThemedText style={journeyStyles.cta} color="rgba(255,255,255,0.5)">
          Start seeking ✦ dreamseekerapp.com
        </ThemedText>
      </View>
    </View>
  );
});

// --- WinCard Styles ---

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 400,
    borderRadius: Radius["2xl"],
    overflow: "hidden",
    padding: Spacing.xl,
    justifyContent: "space-between",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSize["6xl"],
    fontWeight: "800",
    lineHeight: 34,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSize.base,
    fontWeight: "600",
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
    backgroundColor: "rgba(255,255,255,0.2)",
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

// --- JourneyCard Styles ---

const journeyStyles = StyleSheet.create({
  card: {
    width: 390,
    height: 700,
    borderRadius: Radius["2xl"],
    overflow: "hidden",
    padding: Spacing["2xl"],
    justifyContent: "space-between",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  radialGlow: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,215,0,0.1)",
  },
  topRightSparkle: {
    position: "absolute",
    top: 24,
    right: 24,
  },
  topLeftSparkle: {
    position: "absolute",
    top: 32,
    left: 28,
  },
  bottomLeftSparkle: {
    position: "absolute",
    bottom: 100,
    left: 20,
  },
  headerSection: {
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 42,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    marginTop: Spacing.xs,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  categoryText: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeline: {
    gap: Spacing.lg,
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.2)",
    paddingVertical: Spacing.md,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  timelineLine: {
    position: "absolute",
    left: 10,
    top: 28,
    width: 3,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  timelineDotCompleted: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  timelineDotIncomplete: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  timelineText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  moreText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    paddingLeft: 40,
    fontStyle: "italic",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandingSection: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  handle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  brandName: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    letterSpacing: 1,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  brandCreator: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  cta: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
