import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { type SlideColors, type Confidence, CONFIDENCE_OPTIONS } from './shared';
import { RadioOptionList } from './radio-option-list';
import { GabbyResponseCard } from './gabby-response-card';

function getGabbyResponse(selected: Confidence | null): string | null {
  switch (selected) {
    case 'confident':
      return "That's the energy! Channel that confidence into action.";
    case 'somewhat':
      return "That's honest. Confidence grows with every small win.";
    case 'not-confident':
      return "Perfect. Be confident. Be delusional. And if you're not there yet\u2014borrow some of the delusional confidence that I have in you until you're able to fully rise.";
    default:
      return null;
  }
}

export function ConfidenceSlide({
  colors,
  selected,
  onSelect,
}: {
  colors: SlideColors;
  selected: Confidence | null;
  onSelect: (confidence: Confidence) => void;
}) {
  const response = getGabbyResponse(selected);

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">How confident are you?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Be honest. There&apos;s no wrong answer here.
        </ThemedText>
      </View>

      <RadioOptionList
        options={CONFIDENCE_OPTIONS}
        selected={selected}
        onSelect={onSelect}
        colors={colors}
        accessibilityPrefix="Confidence level"
      />

      {response && <GabbyResponseCard response={response} colors={colors} />}
    </View>
  );
}
