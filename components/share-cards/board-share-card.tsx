import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { ShareCardShell, type ShareCardSparkle } from '@/components/engagement/share-card-shell';
import { ThemedText } from '@/components/ui/themed-text';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { SHARE_CARD } from '@/constants/share-card';

const COL_GAP = Spacing.sm;
const GRID_WIDTH = SHARE_CARD.WIDTH - Spacing.xl * 2; // card width minus padding

type BoardShareCardProps = {
  boardName: string;
  pinImages: (string | null)[];
  pinCount: number;
  handle?: string;
};

const SPARKLES: ShareCardSparkle[] = [
  { icon: 'sparkles', size: IconSize.lg, color: 'rgba(255,255,255,0.15)', position: { top: 30, right: 30 } },
  { icon: 'sparkles', size: IconSize.md, color: 'rgba(255,255,255,0.18)', position: { bottom: 120, right: 25 } },
];

export const BoardShareCard = forwardRef<View, BoardShareCardProps>(function BoardShareCard(
  { boardName, pinImages, pinCount, handle },
  ref,
) {
  const images = pinImages.filter((url): url is string => url != null).slice(0, 4);
  const overflow = pinCount > images.length ? pinCount - images.length : 0;

  return (
    <ShareCardShell
      ref={ref}
      colors={SHARE_CARD.GRADIENT}
      radialGlow={SHARE_CARD.RADIAL_GLOW}
      sparkles={SPARKLES}
      handle={handle}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.label} color="rgba(255,255,255,0.6)">
            {handle ? `${handle.split(' ')[0]}\u2019s Vision Board` : 'MY VISION BOARD'}
          </ThemedText>
          <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={2}>
            {boardName}
          </ThemedText>
        </View>

        {/* Masonry grid */}
        {images.length > 0 && <MasonryPreview images={images} />}

        {/* Overflow */}
        {overflow > 0 && (
          <ThemedText style={styles.overflow} color="rgba(255,255,255,0.6)">
            +{overflow} more
          </ThemedText>
        )}

        {/* Hype */}
        <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>
          {pickHype('visionBoard')}
        </ThemedText>
      </View>
    </ShareCardShell>
  );
});

// ── Masonry layout ───────────────────────────────────────────────────────────

function MasonryPreview({ images }: { images: string[] }) {
  // Distribute into 2 columns round-robin
  const left: string[] = [];
  const right: string[] = [];
  images.forEach((url, i) => (i % 2 === 0 ? left : right).push(url));

  // True masonry: tops aligned, different heights per cell so bottoms are ragged
  const leftHeights = [180, 140];
  const rightHeights = [140, 180];

  return (
    <View style={styles.masonry}>
      <View style={styles.masonryCol}>
        {left.map((url, i) => (
          <View key={i} style={[styles.masonryCell, { height: leftHeights[i % leftHeights.length] }]}>
            <Image source={{ uri: url }} style={styles.masonryImage} contentFit="cover" />
          </View>
        ))}
      </View>
      <View style={styles.masonryCol}>
        {right.map((url, i) => (
          <View key={i} style={[styles.masonryCell, { height: rightHeights[i % rightHeights.length] }]}>
            <Image source={{ uri: url }} style={styles.masonryImage} contentFit="cover" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  // Masonry
  masonry: {
    flexDirection: 'row',
    gap: COL_GAP,
    width: GRID_WIDTH,
    alignItems: 'flex-start',
  },
  masonryCol: {
    flex: 1,
    gap: COL_GAP,
  },
  masonryCell: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  masonryImage: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
  },
  overflow: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  hype: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
