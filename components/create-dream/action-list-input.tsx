import { View, TextInput, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, TouchTarget, HitSlop } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

const MAX_ACTIONS = 10;

interface ActionListInputProps {
  actions: string[];
  onChange: (actions: string[]) => void;
}

export function ActionListInput({ actions, onChange }: ActionListInputProps) {
  const colors = useColors();

  const displayActions = actions.length === 0 ? [''] : actions;

  const handleChangeText = (index: number, text: string) => {
    const updated = [...displayActions];
    updated[index] = text;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    haptics.light();
    const updated = displayActions.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? [''] : updated);
  };

  const handleAdd = () => {
    haptics.selection();
    onChange([...displayActions, '']);
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      {displayActions.map((action, index) => (
        <MaterialCard key={index} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md }}>
          <TextInput
            style={{
              flex: 1,
              fontSize: FontSize.lg,
              color: colors.foreground,
              paddingVertical: Spacing.md,
            }}
            placeholder={`Step ${index + 1}`}
            placeholderTextColor={colors.mutedForeground}
            value={action}
            onChangeText={(text) => handleChangeText(index, text)}
            returnKeyType="next"
          />
          {displayActions.length > 1 && (
            <Pressable
              onPress={() => handleRemove(index)}
              hitSlop={HitSlop.sm}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                minWidth: TouchTarget.min,
                minHeight: TouchTarget.min,
                alignItems: 'center',
                justifyContent: 'center',
              })}
              accessibilityRole="button"
              accessibilityLabel={`Remove step ${index + 1}`}
            >
              <ThemedText style={{ fontSize: FontSize['4xl'] }} color={colors.mutedForeground}>
                x
              </ThemedText>
            </Pressable>
          )}
        </MaterialCard>
      ))}

      {displayActions.length < MAX_ACTIONS && (
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            alignItems: 'center',
          })}
          accessibilityRole="button"
          accessibilityLabel="Add another step"
        >
          <ThemedText style={{ fontSize: FontSize.base, fontWeight: '500' }} color={colors.accent}>
            + Add another
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}
