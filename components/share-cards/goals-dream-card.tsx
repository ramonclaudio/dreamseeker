import { View, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { DREAM_CATEGORIES } from '@/convex/constants';
import type { DreamCategory } from '@/constants/dreams';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { SHARE_CARD } from '@/constants/share-card';
import { Radius } from '@/constants/theme';

type GoalsDreamCardProps = {
  title: string;
  category: DreamCategory;
  status: string;
  completedActions: number;
  totalActions: number;
};

export function GoalsDreamCard({ title, category, status, completedActions, totalActions }: GoalsDreamCardProps) {
  const cat = DREAM_CATEGORIES[category] ?? DREAM_CATEGORIES.growth;
  const isCompleted = status === 'completed';
  const progress = totalActions > 0 ? completedActions / totalActions : 0;

  return (
    <View
      style={[
        styles.card,
        { borderColor: `${cat.color}50` },
        isCompleted && styles.completedCard,
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${cat.color}25` }]}>
        <IconSymbol
          name={isCompleted ? 'trophy.fill' : (cat.icon as any)}
          size={IconSize.lg}
          color={isCompleted ? SHARE_CARD.GOLD : cat.color}
        />
      </View>
      <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={2}>
        {title}
      </ThemedText>
      {totalActions > 0 && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: cat.color }]} />
          </View>
          <ThemedText style={styles.progressLabel} color="rgba(255,255,255,0.6)">
            {completedActions}/{totalActions}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const CARD_WIDTH = 165;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: SHARE_CARD.GLASS_BG,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SHARE_CARD.GLASS_BORDER,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  completedCard: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: SHARE_CARD.PROGRESS_HEIGHT,
    borderRadius: Radius.full,
    backgroundColor: SHARE_CARD.PROGRESS_TRACK,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
