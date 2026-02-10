import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell, type ShareCardSparkle } from './share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { SHARE_CARD } from '@/constants/share-card';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';

type StreakShareCardProps = {
  streak: number;
  xpReward: number;
  handle?: string;
};

function getStreakLabel(streak: number): string {
  if (streak >= 100) return 'UNSTOPPABLE QUEEN';
  if (streak >= 30) return 'LEGENDARY';
  if (streak >= 7) return 'ON FIRE';
  return 'STREAK!';
}

const SPARKLES: ShareCardSparkle[] = [
  { icon: 'flame.fill', size: IconSize['3xl'], color: 'rgba(255,255,255,0.15)', position: { top: 70, right: 35 } },
  { icon: 'flame.fill', size: IconSize.xl, color: 'rgba(255,255,255,0.1)', position: { top: 110, left: 25 } },
  { icon: 'flame.fill', size: IconSize.lg, color: 'rgba(255,255,255,0.12)', position: { bottom: 130, right: 30 } },
];

export const StreakShareCard = forwardRef<View, StreakShareCardProps>(function StreakShareCard({ streak, xpReward, handle }, ref) {
  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={SPARKLES}
      handle={handle}
    >
      <View style={styles.center}>
        <IconSymbol name="flame.fill" size={80} color={SHARE_CARD.TEXT_PRIMARY} />
        <ThemedText style={styles.streakNumber} color={SHARE_CARD.TEXT_PRIMARY}>{streak}</ThemedText>
        <ThemedText style={styles.daysLabel} color={SHARE_CARD.TEXT_SECONDARY}>DAY STREAK</ThemedText>
        <ThemedText style={styles.tierLabel} color={SHARE_CARD.TEXT_PRIMARY}>{getStreakLabel(streak)}</ThemedText>
        <View style={styles.xpChip}>
          <IconSymbol name="bolt.fill" size={IconSize.lg} color={SHARE_CARD.GOLD} />
          <ThemedText style={styles.xpText} color={SHARE_CARD.TEXT_PRIMARY}>+{xpReward} XP</ThemedText>
        </View>
      </View>
    </ShareCardShell>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: Spacing.xs },
  streakNumber: {
    fontSize: 120,
    fontWeight: '800',
    letterSpacing: -4,
    lineHeight: 130,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  daysLabel: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  tierLabel: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
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
