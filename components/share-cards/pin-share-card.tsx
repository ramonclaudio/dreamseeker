import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { ShareCardShell, type ShareCardSparkle } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { SHARE_CARD } from '@/constants/share-card';
import { Radius } from '@/constants/theme';

type PinShareCardProps = {
  title?: string;
  description?: string;
  category?: string;
  customCategoryName?: string;
  imageUrl?: string | null;
  tags?: string[];
  username: string;
  displayName?: string;
  handle?: string;
};

const SPARKLES: ShareCardSparkle[] = [
  { icon: 'sparkles', size: IconSize['2xl'], color: 'rgba(255,255,255,0.25)', position: { top: 80, right: 40 } },
  { icon: 'sparkles', size: IconSize.lg, color: 'rgba(255,255,255,0.15)', position: { top: 160, left: 30 } },
  { icon: 'sparkles', size: IconSize.md, color: 'rgba(255,255,255,0.18)', position: { bottom: 160, right: 25 } },
];

export const PinShareCard = forwardRef<View, PinShareCardProps>(
  function PinShareCard({ title, description, category, customCategoryName, imageUrl, tags, username, displayName, handle }, ref) {

    const truncatedDesc = description
      ? description.length > 150
        ? description.slice(0, 150).trimEnd() + '...'
        : description
      : undefined;

    const categoryLabel = category === 'custom' && customCategoryName ? customCategoryName : category;

    return (
      <ShareCardShell
        ref={ref}
        colors={SHARE_CARD.GRADIENT}
        radialGlow={SHARE_CARD.RADIAL_GLOW}
        sparkles={SPARKLES}
        handle={handle}
      >
        <View style={styles.content}>
          {/* Image or icon */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.pinImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <IconSymbol name="pin.fill" size={56} color="rgba(255,255,255,0.85)" />
          )}

          {/* Category badge pill */}
          {categoryLabel && (
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText} color={SHARE_CARD.TEXT_PRIMARY}>
                {categoryLabel}
              </ThemedText>
            </View>
          )}

          {/* Title */}
          {title && (
            <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={2}>
              {title}
            </ThemedText>
          )}

          {/* Description */}
          {truncatedDesc && (
            <ThemedText style={styles.description} color="rgba(255,255,255,0.8)">
              {truncatedDesc}
            </ThemedText>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <ThemedText style={styles.tagText} color={SHARE_CARD.TEXT_PRIMARY}>#{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Attribution */}
          <ThemedText style={styles.attribution} color="rgba(255,255,255,0.6)">
            by {displayName ?? username}
          </ThemedText>
        </View>
      </ShareCardShell>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  pinImage: {
    width: 320,
    maxHeight: 280,
    aspectRatio: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  categoryBadge: {
    backgroundColor: SHARE_CARD.ICON_RING_BG,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: SHARE_CARD.GLASS_BG,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  attribution: {
    fontSize: FontSize.base,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
});
