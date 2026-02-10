import { View, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { DREAM_CATEGORIES } from '@/convex/constants';
import type { DreamCategory } from '@/constants/dreams';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';

type DreamCardProps = {
  title: string;
  category: DreamCategory;
  status: string;
  completedActions: number;
  totalActions: number;
};

export function DreamCard({ title, category, status, completedActions, totalActions }: DreamCardProps) {
  const cat = DREAM_CATEGORIES[category] ?? DREAM_CATEGORIES.growth;
  const isCompleted = status === 'completed';
  const progress = totalActions > 0 ? completedActions / totalActions : 0;

  return (
    <View style={[styles.card, { borderColor: `${cat.color}40` }]}>
      <View style={[styles.iconBadge, { backgroundColor: `${cat.color}25` }]}>
        <IconSymbol
          name={isCompleted ? 'trophy.fill' : (cat.icon as any)}
          size={IconSize.lg}
          color={isCompleted ? '#FFD700' : cat.color}
        />
      </View>
      <ThemedText style={styles.title} color="#fff" numberOfLines={2}>
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
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
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
