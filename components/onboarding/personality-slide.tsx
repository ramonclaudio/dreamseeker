import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { type SlideColors, type Personality, PERSONALITY_OPTIONS } from './shared';
import { RadioOptionList } from './radio-option-list';
import { GabbyResponseCard } from './gabby-response-card';

function getGabbyResponse(selected: Personality | null): string | null {
  switch (selected) {
    case 'dreamer':
      return "A dreamer at heart! Let's turn those visions into reality.";
    case 'planner':
      return "Love the strategy! Let's put that planning power to work.";
    case 'doer':
      return "Action-oriented! That's the energy we need.";
    case 'explorer':
      return "Curiosity is your superpower. Let's explore what's possible.";
    default:
      return null;
  }
}

export function PersonalitySlide({
  colors,
  selected,
  onSelect,
}: {
  colors: SlideColors;
  selected: Personality | null;
  onSelect: (personality: Personality) => void;
}) {
  const response = getGabbyResponse(selected);

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Which one sounds like you?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Pick the style that fits you best.
        </ThemedText>
      </View>

      <RadioOptionList
        options={PERSONALITY_OPTIONS}
        selected={selected}
        onSelect={onSelect}
        colors={colors}
        accessibilityPrefix="Personality"
      />

      {response && <GabbyResponseCard response={response} colors={colors} />}
    </View>
  );
}
