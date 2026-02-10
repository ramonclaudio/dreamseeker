import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell, type ShareCardSparkle } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { GoalsDreamCard } from './goals-dream-card';
import type { DreamCategory } from '@/constants/dreams';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { SHARE_CARD } from '@/constants/share-card';

type Dream = {
  _id: string;
  title: string;
  category: DreamCategory;
  status: string;
  completedActions: number;
  totalActions: number;
};

type GoalsShareCardProps = {
  dreams: Dream[];
  handle?: string;
};

const SPARKLES: ShareCardSparkle[] = [
  { icon: 'sparkles', size: IconSize.lg, color: 'rgba(255,255,255,0.3)', position: { top: 30, right: 28 } },
  { icon: 'sparkles', size: IconSize.sm, color: 'rgba(255,255,255,0.2)', position: { top: 60, right: 60 } },
  { icon: 'sparkles', size: IconSize.md, color: 'rgba(255,255,255,0.2)', position: { bottom: 120, left: 20 } },
  { icon: 'sparkles', size: IconSize.sm, color: SHARE_CARD.SPARKLE_GOLD_20, position: { bottom: 80, right: 24 } },
];

export const GoalsShareCard = forwardRef<View, GoalsShareCardProps>(function GoalsShareCard({ dreams, handle }, ref) {
  const visibleDreams = dreams.slice(0, 6);
  const overflow = dreams.length > 6 ? dreams.length - 6 : 0;
  const now = new Date();
  const year = now.getFullYear();
  const completedCount = dreams.filter((d) => d.status === 'completed').length;

  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={SPARKLES}
      handle={handle}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerLabel} color="rgba(255,255,255,0.6)">
          MY {year} DREAMS
        </ThemedText>
        <ThemedText style={styles.headerTitle} color={SHARE_CARD.TEXT_PRIMARY}>My Dreams</ThemedText>
        <View style={styles.handleRow}>
          <ThemedText style={styles.headerHandle} color="rgba(255,255,255,0.7)">
            @{handle || 'dreamseeker'}
          </ThemedText>
          {completedCount > 0 && (
            <View style={styles.completedChip}>
              <IconSymbol name="trophy.fill" size={IconSize.sm} color={SHARE_CARD.GOLD} />
              <ThemedText style={styles.completedChipText} color={SHARE_CARD.GOLD}>
                {completedCount} achieved
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {visibleDreams.map((dream) => (
          <GoalsDreamCard
            key={dream._id}
            title={dream.title}
            category={dream.category}
            status={dream.status}
            completedActions={dream.completedActions}
            totalActions={dream.totalActions}
          />
        ))}
      </View>
      {overflow > 0 && (
        <ThemedText style={styles.overflow} color="rgba(255,255,255,0.6)">
          +{overflow} more dreams
        </ThemedText>
      )}

      {/* Hype text */}
      <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>
        {pickHype('visionBoard')}
      </ThemedText>
    </ShareCardShell>
  );
});

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  headerLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: FontSize['5xl'],
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  headerHandle: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  completedChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  overflow: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -Spacing.md,
  },
  hype: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
