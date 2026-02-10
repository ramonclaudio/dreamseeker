import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { CATEGORY_ICONS, DREAM_CATEGORIES, type DreamCategory } from '@/constants/dreams';
import { SHARE_CARD, DEFAULT_SPARKLES } from '@/constants/share-card';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';

type DreamShareCardProps = {
  title: string;
  category: DreamCategory;
  status: string;
  whyItMatters?: string;
  completedActions: number;
  totalActions: number;
  targetDate?: number;
  createdAt: number;
  actions?: { text: string; isCompleted: boolean }[];
  completedAt?: number;
  handle?: string;
};

export const DreamShareCard = forwardRef<View, DreamShareCardProps>(function DreamShareCard(
  { title, category, status, whyItMatters, completedActions, totalActions, actions, createdAt, completedAt, handle },
  ref,
) {
  const progress = totalActions > 0 ? completedActions / totalActions : 0;
  const isCompleted = status === 'completed';
  const categoryConfig = DREAM_CATEGORIES[category];
  const daysCount = completedAt
    ? Math.max(1, Math.ceil((completedAt - createdAt) / (1000 * 60 * 60 * 24)))
    : undefined;

  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={DEFAULT_SPARKLES}
      handle={handle}
    >
      <View style={styles.content}>
        {/* Achieved badge or label */}
        {isCompleted ? (
          <View style={styles.achievedRow}>
            <IconSymbol name="trophy.fill" size={IconSize['3xl']} color={SHARE_CARD.GOLD} />
            <ThemedText style={styles.achievedText} color={SHARE_CARD.GOLD}>
              DREAM ACHIEVED
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.label} color={SHARE_CARD.TEXT_SECONDARY}>
            MY DREAM
          </ThemedText>
        )}

        {/* Title */}
        <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={3}>
          {title}
        </ThemedText>

        {/* Category pill */}
        <View style={styles.categoryPill}>
          <IconSymbol name={CATEGORY_ICONS[category]} size={IconSize.lg} color={SHARE_CARD.TEXT_PRIMARY} />
          <ThemedText style={styles.categoryText} color={SHARE_CARD.TEXT_PRIMARY}>
            {categoryConfig?.label ?? category}
          </ThemedText>
        </View>

        {/* Actions checklist (completed dreams) */}
        {isCompleted && actions && actions.length > 0 && (
          <View style={styles.actionsList}>
            {actions.slice(0, 6).map((action, i) => (
              <View key={i} style={styles.actionRow}>
                <View style={[styles.actionDot, action.isCompleted && styles.actionDotCompleted]}>
                  {action.isCompleted && (
                    <IconSymbol name="checkmark" size={10} color={SHARE_CARD.GRADIENT[1]} />
                  )}
                </View>
                <ThemedText style={styles.actionText} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={1}>
                  {action.text}
                </ThemedText>
              </View>
            ))}
            {actions.length > 6 && (
              <ThemedText style={styles.moreActions} color={SHARE_CARD.TEXT_SECONDARY}>
                +{actions.length - 6} more
              </ThemedText>
            )}
          </View>
        )}

        {/* Progress bar (active dreams) */}
        {!isCompleted && totalActions > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <ThemedText style={styles.progressPct} color="rgba(255,255,255,0.8)">
                {Math.round(progress * 100)}%
              </ThemedText>
            </View>
            <ThemedText style={styles.progressLabel} color={SHARE_CARD.TEXT_SECONDARY}>
              {completedActions}/{totalActions} actions
            </ThemedText>
          </View>
        )}

        {/* Why it matters (active dreams) */}
        {!isCompleted && whyItMatters ? (
          <ThemedText style={styles.quote} color="rgba(255,255,255,0.6)" numberOfLines={2}>
            &ldquo;{whyItMatters}&rdquo;
          </ThemedText>
        ) : null}

        {/* Stats row (completed) */}
        {isCompleted && (
          <View style={styles.statsRow}>
            {daysCount != null && (
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue} color={SHARE_CARD.TEXT_PRIMARY}>
                  {daysCount}
                </ThemedText>
                <ThemedText style={styles.statLabel} color={SHARE_CARD.TEXT_SECONDARY}>
                  {daysCount === 1 ? 'Day' : 'Days'}
                </ThemedText>
              </View>
            )}
            <View style={styles.statCard}>
              <ThemedText style={styles.statValue} color={SHARE_CARD.TEXT_PRIMARY}>
                {completedActions}
              </ThemedText>
              <ThemedText style={styles.statLabel} color={SHARE_CARD.TEXT_SECONDARY}>
                Actions
              </ThemedText>
            </View>
          </View>
        )}

        {/* Hype text */}
        <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>
          {pickHype(isCompleted ? 'achievement' : 'dream')}
        </ThemedText>
      </View>
    </ShareCardShell>
  );
});

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: Spacing.md },
  achievedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  achievedText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: SHARE_CARD.GLASS_BG,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  actionsList: {
    width: '100%',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SHARE_CARD.GLASS_BG,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionDotCompleted: {
    backgroundColor: SHARE_CARD.GOLD,
    borderColor: SHARE_CARD.GOLD,
  },
  actionText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  moreActions: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontStyle: 'italic',
    paddingLeft: 32,
  },
  progressSection: { width: '100%', gap: Spacing.xs },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
    backgroundColor: SHARE_CARD.PROGRESS_FILL,
  },
  progressPct: { fontSize: FontSize.base, fontWeight: '700', minWidth: 36 },
  progressLabel: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
  quote: {
    fontSize: FontSize.base,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: SHARE_CARD.GLASS_BG,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SHARE_CARD.GLASS_BORDER,
    paddingVertical: Spacing.lg,
    gap: Spacing.xxs,
  },
  statValue: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    lineHeight: FontSize['4xl'] * 1.2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hype: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
