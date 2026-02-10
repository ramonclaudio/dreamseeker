import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize, HitSlop } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import type { Mood } from '@/constants/dreams';

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '\u{1F929}' },
  { value: 'good', label: 'Good', emoji: '\u{1F60A}' },
  { value: 'okay', label: 'Okay', emoji: '\u{1F610}' },
  { value: 'tough', label: 'Tough', emoji: '\u{1F614}' },
];

type MorningCheckInProps = {
  name?: string;
  onSubmit: (mood: Mood, intention?: string) => Promise<void>;
};

function getDismissKey(): string {
  const today = new Date().toISOString().split('T')[0];
  return `@morning_dismissed_${today}`;
}

export function MorningCheckIn({ name, onSubmit }: MorningCheckInProps) {
  const colors = useColors();
  const [dismissed, setDismissed] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intention, setIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(getDismissKey())
      .then((val) => { if (val) setDismissed(true); })
      .catch(() => {});
  }, []);

  const handleDismiss = useCallback(async () => {
    setDismissed(true);
    await AsyncStorage.setItem(getDismissKey(), '1').catch(() => {});
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedMood, intention.trim() || undefined);
      haptics.success();
      setDismissed(true);
    } catch {
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMood, intention, isSubmitting, onSubmit]);

  if (dismissed) return null;

  return (
    <MaterialCard style={{ padding: Spacing.xl, marginBottom: Spacing.xl }}>
      {/* Dismiss button */}
      <Pressable
        onPress={handleDismiss}
        hitSlop={HitSlop.md}
        style={{ position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 1 }}
        accessibilityLabel="Dismiss morning check-in"
      >
        <IconSymbol name="xmark" size={IconSize.lg} color={colors.mutedForeground} />
      </Pressable>

      <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '700', marginBottom: Spacing.xs }}>
        {name ? `Good morning, ${name}!` : 'Good morning!'}
      </ThemedText>
      <ThemedText style={{ fontSize: FontSize.base, marginBottom: Spacing.xl }} color={colors.mutedForeground}>
        How are we showing up today?
      </ThemedText>

      {/* Mood picker */}
      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.sm,
          marginBottom: Spacing.xl,
        }}
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.value;
          return (
            <Pressable
              key={mood.value}
              onPress={() => {
                haptics.selection();
                setSelectedMood(mood.value);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing.xxs,
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.xs,
                borderRadius: Radius.full,
                backgroundColor: isSelected ? colors.accent : colors.secondary,
                borderWidth: 1,
                borderColor: isSelected ? colors.accent : colors.border,
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={mood.label}
            >
              <ThemedText style={{ fontSize: FontSize.lg }}>{mood.emoji}</ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.xs, fontWeight: '600' }}
                color={isSelected ? colors.accentForeground : colors.foreground}
              >
                {mood.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Intention input */}
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
        }}
        placeholder="What's your focus today? (optional)"
        placeholderTextColor={colors.mutedForeground}
        value={intention}
        onChangeText={setIntention}
        returnKeyType="done"
      />

      {/* Submit button */}
      <Pressable
        onPress={handleSubmit}
        disabled={!selectedMood || isSubmitting}
        style={({ pressed }) => ({
          backgroundColor: selectedMood ? colors.accent : colors.muted,
          paddingVertical: Spacing.md,
          borderRadius: Radius.md,
          alignItems: 'center',
          opacity: pressed ? 0.8 : !selectedMood ? 0.5 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Submit morning check-in"
      >
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: '600' }}
          color={selectedMood ? colors.accentForeground : colors.mutedForeground}
        >
          {isSubmitting ? 'Saving...' : "Let's Go"}
        </ThemedText>
      </Pressable>
    </MaterialCard>
  );
}
