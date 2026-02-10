import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell } from './share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { SHARE_CARD, DEFAULT_SPARKLES } from '@/constants/share-card';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';

type LevelShareCardProps = {
  level: number;
  levelTitle: string;
  handle?: string;
};

export const LevelShareCard = forwardRef<View, LevelShareCardProps>(function LevelShareCard({ level, levelTitle, handle }, ref) {
  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={DEFAULT_SPARKLES}
      handle={handle}
    >
      <View style={styles.center}>
        <IconSymbol name="crown.fill" size={IconSize['5xl']} color={SHARE_CARD.GOLD} />
        <ThemedText style={styles.levelNumber} color={SHARE_CARD.TEXT_PRIMARY}>{level}</ThemedText>
        <ThemedText style={styles.levelUp} color={SHARE_CARD.TEXT_PRIMARY}>LEVEL UP!</ThemedText>
        <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>{pickHype('levelUp')}</ThemedText>
        <ThemedText style={styles.levelTitle} color="rgba(255,255,255,0.8)">{levelTitle}</ThemedText>
      </View>
    </ShareCardShell>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: Spacing.xs },
  levelNumber: {
    fontSize: 120,
    fontWeight: '800',
    letterSpacing: -4,
    lineHeight: 130,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  levelUp: { fontSize: FontSize['6xl'], fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  hype: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  levelTitle: { fontSize: FontSize['4xl'], fontWeight: '600' },
});
