import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { type SlideColors, type Pace, PACE_OPTIONS } from './shared';
import { RadioOptionList } from './radio-option-list';

export function PaceSlide({
  colors,
  selected,
  onSelect,
}: {
  colors: SlideColors;
  selected: Pace | null;
  onSelect: (pace: Pace) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Choose your pace</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          How quickly do you want to move toward your dreams?
        </ThemedText>
      </View>

      <RadioOptionList
        options={PACE_OPTIONS}
        selected={selected}
        onSelect={onSelect}
        colors={colors}
      />
    </View>
  );
}
