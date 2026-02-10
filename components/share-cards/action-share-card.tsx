import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from '@/constants/dreams';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { SHARE_CARD, DEFAULT_SPARKLES } from '@/constants/share-card';
import { pickHype } from '@/constants/ui';

type ActionShareCardProps = {
  actionText: string;
  dreamTitle: string;
  dreamCategory: DreamCategory;
  completedActions: number;
  totalActions: number;
  handle?: string;
};


export const ActionShareCard = forwardRef<View, ActionShareCardProps>(function ActionShareCard(
  { actionText, dreamTitle, dreamCategory, completedActions, totalActions, handle },
  ref,
) {
  const categoryConfig = DREAM_CATEGORIES[dreamCategory];
  const progress = totalActions > 0 ? completedActions / totalActions : 0;

  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={DEFAULT_SPARKLES}
      handle={handle}
    >
      <View style={styles.center}>
        {/* Hero: checkmark in ring */}
        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <IconSymbol name="checkmark" size={64} color={SHARE_CARD.TEXT_PRIMARY} weight="bold" />
          </View>
        </View>

        {/* Label */}
        <ThemedText style={styles.label} color={SHARE_CARD.TEXT_SECONDARY}>
          ACTION COMPLETE
        </ThemedText>

        {/* Action text */}
        <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={3}>
          {actionText}
        </ThemedText>

        {/* Hype text */}
        <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>
          {pickHype('action')}
        </ThemedText>

        {/* Dream context row */}
        <View style={styles.contextRow}>
          <IconSymbol name={CATEGORY_ICONS[dreamCategory]} size={IconSize.lg} color="rgba(255,255,255,0.6)" />
          <ThemedText style={styles.contextText} color="rgba(255,255,255,0.6)" numberOfLines={1}>
            {categoryConfig?.label ?? dreamCategory} · {dreamTitle}
          </ThemedText>
        </View>

        {/* Progress bar */}
        {totalActions > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <ThemedText style={styles.progressLabel} color={SHARE_CARD.TEXT_SECONDARY}>
              {completedActions}/{totalActions}
            </ThemedText>
          </View>
        )}

        {/* XP chip */}
        <View style={styles.xpChip}>
          <IconSymbol name="bolt.fill" size={IconSize.lg} color={SHARE_CARD.GOLD} />
          <ThemedText style={styles.xpText} color={SHARE_CARD.TEXT_PRIMARY}>+10 XP</ThemedText>
        </View>
      </View>
    </ShareCardShell>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: Spacing.sm },
  iconRing: {
    width: SHARE_CARD.ICON_RING_OUTER,
    height: SHARE_CARD.ICON_RING_OUTER,
    borderRadius: SHARE_CARD.ICON_RING_OUTER / 2,
    borderWidth: 3,
    borderColor: SHARE_CARD.ICON_RING_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  iconInner: {
    width: SHARE_CARD.ICON_RING_INNER,
    height: SHARE_CARD.ICON_RING_INNER,
    borderRadius: SHARE_CARD.ICON_RING_INNER / 2,
    backgroundColor: SHARE_CARD.ICON_RING_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSize['6xl'],
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  hype: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contextText: { fontSize: FontSize.base, fontWeight: '500', flexShrink: 1 },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: SHARE_CARD.PROGRESS_TRACK,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: SHARE_CARD.PROGRESS_FILL,
  },
  progressLabel: { fontSize: FontSize.base, fontWeight: '700' },
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: SHARE_CARD.XP_CHIP_BG,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: SHARE_CARD.XP_CHIP_BORDER,
  },
  xpText: { fontSize: FontSize.lg, fontWeight: '700' },
});
