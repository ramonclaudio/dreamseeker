import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

interface SuggestionChipsProps {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
}

export function SuggestionChips({ options, selected, onSelect }: SuggestionChipsProps) {
  const colors = useColors();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <Pressable
            key={option}
            onPress={() => {
              haptics.selection();
              onSelect(option);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.full,
              backgroundColor: isSelected ? colors.accent : colors.secondary,
              borderWidth: 1,
              borderColor: isSelected ? colors.accent : colors.border,
            })}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option}
          >
            <ThemedText
              style={{ fontSize: FontSize.base, fontWeight: '500' }}
              color={isSelected ? colors.onColor : colors.foreground}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
