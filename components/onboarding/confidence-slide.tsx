import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';
import { type SlideColors, type Confidence, CONFIDENCE_OPTIONS } from './shared';

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

      <View style={{ gap: Spacing.md }}>
        {CONFIDENCE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                haptics.selection();
                onSelect(option.value);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Confidence level: ${option.label}`}
            >
              <MaterialCard
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                  padding: Spacing.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accentBlue : colors.border,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.accentBlue,
                      }}
                    />
                  )}
                </View>
                <ThemedText style={{ fontSize: FontSize.lg, flex: 1 }}>
                  {option.label}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>

      {response && (
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ fontSize: FontSize.lg, fontStyle: 'italic', textAlign: 'center' }}
          >
            &quot;{response}&quot;
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm }}
            color={colors.mutedForeground}
          >
            — Gabby
          </ThemedText>
        </MaterialCard>
      )}
    </View>
  );
}
