import { forwardRef, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { SvgGradientBg } from '@/components/ui/svg-gradient-bg';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { SHARE_CARD } from '@/constants/share-card';
import { Spacing, FontSize } from '@/constants/layout';

export type ShareCardSparkle = {
  icon: IconSymbolName;
  size: number;
  color: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
};

type ShareCardShellProps = {
  colors: [string, string];
  height?: number;
  radialGlow?: { top?: number; left?: number; right?: number; width: number; height: number; color: string };
  sparkles?: ShareCardSparkle[];
  handle?: string;
  children: ReactNode;
};

export const ShareCardShell = forwardRef<View, ShareCardShellProps>(function ShareCardShell(
  { colors, height = SHARE_CARD.HEIGHT, radialGlow, sparkles, handle, children },
  ref,
) {
  return (
    <View ref={ref} style={[styles.card, { height }]} collapsable={false}>
      <SvgGradientBg colors={colors} width={SHARE_CARD.WIDTH} height={height} direction="diagonal" />
      <View style={styles.glassOverlay} />

      {radialGlow && (
        <View
          style={{
            position: 'absolute',
            top: radialGlow.top,
            left: radialGlow.left,
            right: radialGlow.right,
            width: radialGlow.width,
            height: radialGlow.height,
            borderRadius: radialGlow.width / 2,
            backgroundColor: radialGlow.color,
          }}
        />
      )}

      {sparkles?.map((s, i) => (
        <View key={i} style={[styles.sparkle, s.position]}>
          <IconSymbol name={s.icon} size={s.size} color={s.color} />
        </View>
      ))}

      {children}
      <View style={styles.footer}>
        <ThemedText style={styles.handle} color={SHARE_CARD.TEXT_SECONDARY}>@{handle || 'dreamseeker'}</ThemedText>
        <View style={styles.brandRow}>
          <ThemedText style={styles.brandName} color={SHARE_CARD.TEXT_TERTIARY}>DreamSeeker</ThemedText>
          <View style={styles.brandDot} />
          <ThemedText style={styles.brandCreator} color="rgba(255,255,255,0.4)">@packslight</ThemedText>
        </View>
        <ThemedText style={styles.cta} color="rgba(255,255,255,0.35)">{SHARE_CARD.CTA}</ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { width: SHARE_CARD.WIDTH, overflow: 'hidden', paddingHorizontal: Spacing.xl, paddingVertical: Spacing['4xl'], justifyContent: 'center', gap: Spacing.xl },
  glassOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: SHARE_CARD.GLASS_OVERLAY },
  sparkle: { position: 'absolute' },
  footer: { alignItems: 'center', gap: 3 },
  handle: { fontSize: FontSize.base, fontWeight: '500' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  brandName: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.5 },
  brandDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },
  brandCreator: { fontSize: FontSize.sm, fontWeight: '500' },
  cta: { fontSize: FontSize.xs, fontWeight: '500' },
});
