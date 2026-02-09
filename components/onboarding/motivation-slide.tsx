import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { type SlideColors, type Motivation, MOTIVATION_OPTIONS } from './shared';
import { SelectionGrid } from './selection-grid';

export function MotivationSlide({
  colors,
  selectedMotivations,
  onToggle,
}: {
  colors: SlideColors;
  selectedMotivations: Motivation[];
  onToggle: (motivation: Motivation) => void;
}) {
  const items = MOTIVATION_OPTIONS.map((option) => ({
    key: option.value,
    label: option.label,
    icon: option.icon,
    color: colors.accentBlue,
  }));

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What brings you here?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Select all that apply — we&apos;ll personalize your experience.
        </ThemedText>
      </View>

      <SelectionGrid
        items={items}
        selectedKeys={selectedMotivations}
        onToggle={(key) => onToggle(key as Motivation)}
        colors={colors}
      />
    </View>
  );
}
