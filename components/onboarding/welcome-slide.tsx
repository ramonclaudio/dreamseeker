import { View, TextInput } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function NameSlide({
  colors,
  displayName,
  onChangeName,
}: {
  colors: SlideColors;
  displayName: string;
  onChangeName: (text: string) => void;
}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: Spacing['2xl'] }}>
      {/* App icon with glow */}
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: Radius.full,
            backgroundColor: colors.surfaceTinted,
            borderWidth: 1,
            borderColor: colors.borderAccent,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.glowShadow,
            shadowOpacity: 1,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 100, height: 100 }}
            contentFit="contain"
            accessible
            accessibilityLabel="DreamSeeker cloud icon"
          />
        </View>
      </View>

      {/* Title + subtitle */}
      <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          What should we call you?
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize['2xl'] }}
          color={colors.mutedForeground}
        >
          Let&apos;s make this yours.
        </ThemedText>
      </View>

      {/* Name input */}
      <TextInput
        style={{
          backgroundColor: colors.secondary,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          fontSize: FontSize.xl,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        placeholder="Your name"
        placeholderTextColor={colors.mutedForeground}
        value={displayName}
        onChangeText={onChangeName}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Enter your name"
      />

      {/* Gabby quote card */}
      <MaterialCard
        variant="tinted"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <IconSymbol name="sparkles" size={IconSize.xl} color={colors.accent} />
        <ThemedText
          style={{ fontSize: FontSize.base, fontStyle: 'italic', flex: 1 }}
          color={colors.accent}
        >
          Seek risk. Seize opportunity. See the world.
        </ThemedText>
      </MaterialCard>
    </View>
  );
}
