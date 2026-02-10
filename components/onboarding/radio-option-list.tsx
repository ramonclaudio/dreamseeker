import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';
import type { SlideColors } from './shared';

type RadioOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: IconSymbolName;
};

export function RadioOptionList<T extends string>({
  options,
  selected,
  onSelect,
  colors,
  accessibilityPrefix = 'Option',
}: {
  options: readonly RadioOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  colors: SlideColors;
  accessibilityPrefix?: string;
}) {
  return (
    <View style={{ gap: Spacing.md }}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        const hasDetails = option.description || option.icon;

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
            accessibilityLabel={`${accessibilityPrefix}: ${option.label}`}
          >
            <MaterialCard
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.md,
                padding: Spacing.lg,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? colors.accent : colors.border,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.accent : colors.border,
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
                      backgroundColor: colors.accent,
                    }}
                  />
                )}
              </View>
              {option.icon && (
                <IconSymbol
                  name={option.icon}
                  size={IconSize.xl}
                  color={isSelected ? colors.accent : colors.mutedForeground}
                />
              )}
              {hasDetails ? (
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                    {option.label}
                  </ThemedText>
                  {option.description && (
                    <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
                      {option.description}
                    </ThemedText>
                  )}
                </View>
              ) : (
                <ThemedText style={{ fontSize: FontSize.lg, flex: 1 }}>
                  {option.label}
                </ThemedText>
              )}
            </MaterialCard>
          </Pressable>
        );
      })}
    </View>
  );
}
