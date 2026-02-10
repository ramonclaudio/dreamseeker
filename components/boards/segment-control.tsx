import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type SegmentControlProps = {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export function SegmentControl({ segments, activeIndex, onChange }: SegmentControlProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      {segments.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={label}
            onPress={() => {
              if (!isActive) {
                haptics.selection();
                onChange(index);
              }
            }}
            style={[
              styles.segment,
              isActive && [styles.activeSegment, { backgroundColor: colors.card }],
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <ThemedText
              style={[styles.label, isActive && styles.activeLabel]}
              color={isActive ? colors.foreground : colors.mutedForeground}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.DEFAULT,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.DEFAULT - 2,
  },
  activeSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '600',
  },
});
