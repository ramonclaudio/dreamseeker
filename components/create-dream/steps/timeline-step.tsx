import { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import {
  TIMELINE_PRESETS,
  TIMELINE_UNITS,
  formatDuration,
  type TimelineDuration,
  type TimelineUnit,
} from '@/constants/dream-suggestions';

function durationsEqual(a: TimelineDuration | null, b: TimelineDuration): boolean {
  return a !== null && a.amount === b.amount && a.unit === b.unit;
}

function isPreset(duration: TimelineDuration | null): boolean {
  if (!duration) return false;
  return TIMELINE_PRESETS.some((p) => durationsEqual(duration, p));
}

export function TimelineStep({
  selected,
  onSelect,
  onSkip,
}: {
  selected: TimelineDuration | null;
  onSelect: (date: TimelineDuration | null) => void;
  onSkip: () => void;
}) {
  const colors = useColors();
  const [showCustom, setShowCustom] = useState(() => selected !== null && !isPreset(selected));
  const [customAmount, setCustomAmount] = useState(() =>
    selected && !isPreset(selected) ? String(selected.amount) : '',
  );
  const [customUnit, setCustomUnit] = useState<TimelineUnit>(() =>
    selected && !isPreset(selected) ? selected.unit : 'weeks',
  );

  const handlePresetPress = (preset: TimelineDuration) => {
    haptics.selection();
    if (durationsEqual(selected, preset)) {
      onSelect(null);
    } else {
      setShowCustom(false);
      onSelect(preset);
    }
  };

  const handleCustomToggle = () => {
    haptics.selection();
    if (showCustom) {
      setShowCustom(false);
      onSelect(null);
    } else {
      setShowCustom(true);
      onSelect(null);
      const parsed = parseInt(customAmount, 10);
      if (parsed > 0) {
        onSelect({ amount: parsed, unit: customUnit });
      }
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 3);
    setCustomAmount(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (parsed > 0) {
      onSelect({ amount: parsed, unit: customUnit });
    } else {
      onSelect(null);
    }
  };

  const handleUnitChange = (unit: TimelineUnit) => {
    haptics.selection();
    setCustomUnit(unit);
    const parsed = parseInt(customAmount, 10);
    if (parsed > 0) {
      onSelect({ amount: parsed, unit });
    }
  };

  const isCustomSelected = showCustom && selected !== null && !isPreset(selected);

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">By when?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Set a target timeline for your dream.
        </ThemedText>
      </View>

      {/* Preset chips + Custom chip */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {TIMELINE_PRESETS.map((preset) => {
          const active = durationsEqual(selected, preset);
          return (
            <Pressable
              key={formatDuration(preset)}
              onPress={() => handlePresetPress(preset)}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderRadius: Radius.full,
                backgroundColor: active ? colors.accentBlue : colors.secondary,
                borderWidth: 1,
                borderColor: active ? colors.accentBlue : colors.border,
              })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={formatDuration(preset)}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: '500' }}
                color={active ? colors.onColor : colors.foreground}
              >
                {formatDuration(preset)}
              </ThemedText>
            </Pressable>
          );
        })}

        {/* Custom chip */}
        <Pressable
          onPress={handleCustomToggle}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderRadius: Radius.full,
            backgroundColor: isCustomSelected ? colors.accentBlue : colors.secondary,
            borderWidth: 1,
            borderColor: isCustomSelected ? colors.accentBlue : colors.border,
          })}
          accessibilityRole="button"
          accessibilityState={{ selected: isCustomSelected }}
          accessibilityLabel="Custom timeline"
        >
          <ThemedText
            style={{ fontSize: FontSize.base, fontWeight: '500' }}
            color={isCustomSelected ? colors.onColor : colors.foreground}
          >
            Custom
          </ThemedText>
        </Pressable>
      </View>

      {/* Custom input row */}
      {showCustom && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <TextInput
            value={customAmount}
            onChangeText={handleAmountChange}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            style={{
              width: 64,
              height: 44,
              borderRadius: Radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.secondary,
              color: colors.foreground,
              fontSize: FontSize.lg,
              fontWeight: '600',
              textAlign: 'center',
            }}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            {TIMELINE_UNITS.map((unit) => {
              const active = customUnit === unit;
              return (
                <Pressable
                  key={unit}
                  onPress={() => handleUnitChange(unit)}
                  style={({ pressed }) => ({
                    opacity: pressed ? Opacity.pressed : 1,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                    backgroundColor: active ? colors.accentBlue : colors.secondary,
                    borderWidth: 1,
                    borderColor: active ? colors.accentBlue : colors.border,
                  })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={unit}
                >
                  <ThemedText
                    style={{ fontSize: FontSize.sm, fontWeight: '500' }}
                    color={active ? colors.onColor : colors.foreground}
                  >
                    {unit}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* No deadline link */}
      <Pressable
        onPress={() => {
          haptics.selection();
          onSkip();
        }}
        style={({ pressed }) => ({
          opacity: pressed ? Opacity.pressed : 1,
          paddingVertical: Spacing.md,
          alignItems: 'center',
        })}
      >
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: '500' }}
          color={!selected ? colors.accentBlue : colors.mutedForeground}
        >
          No deadline
        </ThemedText>
      </Pressable>
    </View>
  );
}
