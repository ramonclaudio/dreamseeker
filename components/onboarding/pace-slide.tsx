import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';
import { type SlideColors, type Pace, PACE_OPTIONS } from './shared';

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

      <View style={{ gap: Spacing.md }}>
        {PACE_OPTIONS.map((option) => {
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
              accessibilityLabel={`${option.label}: ${option.description}`}
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
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
                    {option.description}
                  </ThemedText>
                </View>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
