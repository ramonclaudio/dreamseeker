import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell } from './share-card-shell';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { SHARE_CARD, DEFAULT_SPARKLES } from '@/constants/share-card';

type BadgeShareCardProps = {
  badge: { key: string; title: string; description?: string; icon?: string };
  handle?: string;
};

export const BadgeShareCard = forwardRef<View, BadgeShareCardProps>(function BadgeShareCard({ badge, handle }, ref) {
  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={DEFAULT_SPARKLES}
      handle={handle}
    >
      <View style={styles.center}>
        <View style={styles.iconRing}>
          <View style={styles.iconContainer}>
            <IconSymbol name={(badge.icon as IconSymbolName) ?? 'star.fill'} size={64} color={SHARE_CARD.TEXT_PRIMARY} />
          </View>
        </View>
        <ThemedText style={styles.earned} color={SHARE_CARD.TEXT_SECONDARY}>BADGE EARNED</ThemedText>
        <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY}>{badge.title}</ThemedText>
        <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>{pickHype('badge')}</ThemedText>
        {badge.description && (
          <ThemedText style={styles.description} color={SHARE_CARD.TEXT_SECONDARY}>{badge.description}</ThemedText>
        )}
        <View style={styles.xpChip}>
          <IconSymbol name="bolt.fill" size={IconSize.lg} color={SHARE_CARD.GOLD} />
          <ThemedText style={styles.xpText} color={SHARE_CARD.TEXT_PRIMARY}>+25 XP</ThemedText>
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
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: SHARE_CARD.ICON_RING_INNER,
    height: SHARE_CARD.ICON_RING_INNER,
    borderRadius: SHARE_CARD.ICON_RING_INNER / 2,
    backgroundColor: SHARE_CARD.ICON_RING_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earned: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: {
    fontSize: FontSize['5xl'],
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  hype: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  description: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 20 },
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
