import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, View, RefreshControl, StyleSheet } from 'react-native';

import { PinCard } from './pin-card';
import { Spacing, TAB_BAR_CLEARANCE } from '@/constants/layout';
import type { PinType, DreamCategory } from '@/convex/constants';

type PinData = {
  _id: string;
  userId: string;
  type: PinType;
  title?: string;
  description?: string;
  category?: DreamCategory;
  imageUrl?: string | null;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  linkDomain?: string;
  imageAspectRatio?: number;
  isPersonalOnly: boolean;
  createdAt: number;
  username: string;
  displayName?: string;
  avatarInitial: string;
  avatarUrl?: string | null;
};

type MasonryGridProps = {
  pins: PinData[];
  onPinPress: (pin: PinData) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: ReactNode;
  ListEmptyComponent?: ReactNode;
};

/** Estimate height for a pin based on type and content. */
function estimatePinHeight(pin: PinData, columnWidth: number): number {
  switch (pin.type) {
    case 'image': {
      const ratio = pin.imageAspectRatio ?? 1;
      return ratio * columnWidth + (pin.title ? 40 : 0);
    }
    case 'link':
      return pin.linkImageUrl ? columnWidth * 0.6 + 80 : 120;
    case 'win':
      return 120;
    case 'resource':
      return 120;
    default:
      return 120;
  }
}

export function MasonryGrid({
  pins,
  onPinPress,
  onEndReached,
  refreshing,
  onRefresh,
  ListHeaderComponent,
  ListEmptyComponent,
}: MasonryGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const gap = Spacing.sm;
  const horizontalPadding = Spacing.sm * 2;
  const columnWidth = containerWidth > 0 ? (containerWidth - horizontalPadding - gap) / 2 : 0;

  // Distribute pins to columns based on cumulative estimated height
  const leftColumn: PinData[] = [];
  const rightColumn: PinData[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  for (const pin of pins) {
    const h = estimatePinHeight(pin, columnWidth);
    if (leftHeight <= rightHeight) {
      leftColumn.push(pin);
      leftHeight += h + gap;
    } else {
      rightColumn.push(pin);
      rightHeight += h + gap;
    }
  }

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number }; layoutMeasurement: { height: number }; contentSize: { height: number } } }) => {
      if (!onEndReached) return;
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
        onEndReached();
      }
    },
    [onEndReached]
  );

  return (
    <ScrollView
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      onScroll={handleScroll}
      scrollEventThrottle={200}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={styles.scrollContent}
    >
      {ListHeaderComponent}

      {pins.length === 0 && ListEmptyComponent ? (
        ListEmptyComponent
      ) : columnWidth > 0 ? (
        <View style={[styles.columns, { gap }]}>
          <View style={{ width: columnWidth }}>
            {leftColumn.map((pin) => (
              <PinCard
                key={pin._id}
                pin={pin}
                columnWidth={columnWidth}
                onPress={() => onPinPress(pin)}
              />
            ))}
          </View>
          <View style={{ width: columnWidth }}>
            {rightColumn.map((pin) => (
              <PinCard
                key={pin._id}
                pin={pin}
                columnWidth={columnWidth}
                onPress={() => onPinPress(pin)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  columns: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
  },
});
