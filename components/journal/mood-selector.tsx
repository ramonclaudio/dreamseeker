import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { Mood } from '@/constants/dreams';
import { haptics } from '@/lib/haptics';

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '🌟' },
  { value: 'good', label: 'Good', emoji: '😊' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'tough', label: 'Tough', emoji: '😔' },
];

type MoodSelectorProps = {
  selected?: Mood;
  onSelect: (mood: Mood) => void;
};

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const colors = useColors();

  return (
    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
      {MOODS.map((mood) => {
        const isSelected = selected === mood.value;
        return (
          <Pressable
            key={mood.value}
            onPress={() => {
              haptics.selection();
              onSelect(mood.value);
            }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.sm,
              borderRadius: Radius.lg,
              borderWidth: 1.5,
              borderColor: isSelected ? colors.accent : colors.border,
              backgroundColor: isSelected ? `${colors.accent}15` : colors.card,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={mood.label}
          >
            <ThemedText style={{ fontSize: FontSize['3xl'], marginBottom: Spacing.xxs }}>
              {mood.emoji}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: FontSize.sm,
                fontWeight: isSelected ? '600' : '400',
              }}
              color={isSelected ? colors.foreground : colors.mutedForeground}
            >
              {mood.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
