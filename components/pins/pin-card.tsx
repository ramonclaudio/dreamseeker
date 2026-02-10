import { Pressable, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import type { DreamCategory, PinType } from '@/convex/constants';

type PinData = {
  _id: string;
  type: PinType;
  title?: string;
  description?: string;
  category?: DreamCategory;
  imageUrl?: string | null;
  imageAspectRatio?: number;
  isPersonalOnly: boolean;
  originalPinId?: string;
  createdAt: number;
  username: string;
  displayName?: string;
  avatarInitial: string;
  avatarUrl?: string | null;
};

type PinCardProps = {
  pin: PinData;
  columnWidth: number;
  onPress: () => void;
};

export function PinCard({ pin, columnWidth, onPress }: PinCardProps) {
  const colors = useColors();
  const aspectRatio = pin.imageAspectRatio ?? 1;
  const imageHeight = aspectRatio * columnWidth;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width: columnWidth, opacity: pressed ? Opacity.active : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={pin.title ?? 'Pin'}
    >
      {pin.imageUrl ? (
        <View>
          <Image
            source={{ uri: pin.imageUrl }}
            style={{ width: columnWidth, height: imageHeight, borderRadius: Radius.lg }}
            contentFit="cover"
            transition={200}
          />
          {pin.originalPinId && (
            <View style={styles.savedBadge}>
              <IconSymbol name="bookmark.fill" size={IconSize.sm} color="#fff" />
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.placeholder, { width: columnWidth, height: columnWidth, backgroundColor: colors.muted }]}>
          <IconSymbol name="photo.fill" size={IconSize['3xl']} color={colors.mutedForeground} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  placeholder: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
