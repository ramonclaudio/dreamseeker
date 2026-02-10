import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { MasonryGrid } from '@/components/pins/masonry-grid';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { useColors } from '@/hooks/use-color-scheme';
import { useMyPinsByBoard, type Pin } from '@/hooks/use-pins';
import { Spacing, FontSize } from '@/constants/layout';
import type { Id } from '@/convex/_generated/dataModel';

type BoardPageProps = {
  boardId: Id<'visionBoards'>;
  width: number;
  onPinPress: (pin: Pin) => void;
  onCreatePin: () => void;
  colors: ReturnType<typeof useColors>;
};

export function BoardPage({ boardId, width, onPinPress, onCreatePin, colors }: BoardPageProps) {
  const { pins, isLoading } = useMyPinsByBoard(boardId);

  if (isLoading) {
    return (
      <View style={[styles.centered, { width }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (pins.length === 0) {
    return (
      <View style={[styles.empty, { width }]}>
        <View style={[styles.emptyIconRing, { borderColor: `${colors.primary}30` }]}>
          <View style={[styles.emptyIconBg, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name="sparkles" size={48} color={colors.primary} />
          </View>
        </View>
        <ThemedText style={styles.emptyTitle}>Your Vision Board Awaits</ThemedText>
        <ThemedText style={styles.emptySubtitle} color={colors.mutedForeground}>
          Pin your dreams, wins, and inspiration.{'\n'}Build it. Screenshot it. Share it.
        </ThemedText>
        <GradientButton
          onPress={onCreatePin}
          label="Pin your first dream"
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={{ width }}>
      <MasonryGrid
        pins={pins}
        onPinPress={onPinPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
