import { View, TextInput } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function WhyItMattersSlide({
  colors,
  text,
  onChangeText,
}: {
  colors: SlideColors;
  text: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Why does this matter?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Connect your dream to something deeper. This will fuel you when things get hard.
        </ThemedText>
      </View>

      <TextInput
        style={{
          backgroundColor: colors.secondary,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          fontSize: FontSize.lg,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: 120,
          textAlignVertical: 'top',
        }}
        placeholder="Because it would prove to myself that..."
        placeholderTextColor={colors.mutedForeground}
        value={text}
        onChangeText={onChangeText}
        multiline
        autoFocus
        accessibilityLabel="Why does this dream matter to you?"
        accessibilityHint="Describe why achieving this dream is important"
      />

      <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
        Optional, but powerful.
      </ThemedText>
    </View>
  );
}
