import { useState, useCallback } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type CompletedAction = {
  text: string;
  dreamTitle: string;
};

type DailyReviewProps = {
  completedActions: CompletedAction[];
  onSubmit: (reflection?: string) => Promise<void>;
};

export function DailyReview({ completedActions, onSubmit }: DailyReviewProps) {
  const colors = useColors();
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(reflection.trim() || undefined);
      haptics.success();
    } catch {
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  }, [reflection, isSubmitting, onSubmit]);

  return (
    <MaterialCard style={{ padding: Spacing.xl, marginBottom: Spacing.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg }}>
        <IconSymbol name="checkmark.circle.fill" size={IconSize['2xl']} color={colors.success} />
        <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '700' }}>
          {completedActions.length} action{completedActions.length === 1 ? '' : 's'} completed today!
        </ThemedText>
      </View>

      {/* Completed actions list */}
      <View style={{ gap: Spacing.sm, marginBottom: Spacing.xl }}>
        {completedActions.map((action, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm }}>
            <IconSymbol name="checkmark" size={IconSize.sm} color={colors.success} />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: FontSize.base }} numberOfLines={1}>
                {action.text}
              </ThemedText>
              <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground} numberOfLines={1}>
                {action.dreamTitle}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Reflection input */}
      <TextInput
        style={{
          backgroundColor: colors.secondary,
          borderRadius: Radius.md,
          padding: Spacing.md,
          fontSize: FontSize.base,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: Spacing.lg,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
        placeholder="Real talk — how did today go? (optional)"
        placeholderTextColor={colors.mutedForeground}
        value={reflection}
        onChangeText={setReflection}
        multiline
        numberOfLines={3}
      />

      {/* Submit button */}
      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={({ pressed }) => ({
          backgroundColor: colors.accent,
          paddingVertical: Spacing.md,
          borderRadius: Radius.md,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Submit evening reflection"
      >
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: '600' }}
          color={colors.accentForeground}
        >
          {isSubmitting ? 'Saving...' : 'Lock It In'}
        </ThemedText>
      </Pressable>
    </MaterialCard>
  );
}
