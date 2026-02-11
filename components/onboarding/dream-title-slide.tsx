import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

const CHIPS = [
  { icon: 'bolt.fill' as const, label: 'Seek risk' },
  { icon: 'star.fill' as const, label: 'Seize opportunity' },
  { icon: 'globe' as const, label: 'See the world' },
] as const;

export function SendOffSlide({
  colors,
  displayName,
}: {
  colors: SlideColors;
  displayName: string;
}) {
  const name = displayName.trim();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      {/* App icon with double-ring halo */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer halo ring */}
        <View
          style={{
            width: 180,
            height: 180,
            borderRadius: Radius.full,
            borderWidth: 1,
            borderColor: colors.borderAccent,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Inner filled circle */}
          <View
            style={{
              width: 148,
              height: 148,
              borderRadius: Radius.full,
              backgroundColor: colors.surfaceTinted,
              borderWidth: 1,
              borderColor: colors.borderAccent,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.glowShadow,
              shadowOpacity: 1,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
              accessible
              accessibilityLabel="DreamSeeker cloud icon"
            />
          </View>
        </View>
      </View>

      {/* Headline — personalized if name provided */}
      <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
        <ThemedText
          variant="title"
          style={{ textAlign: 'center', fontSize: 32, lineHeight: 40 }}
        >
          {name ? `${name}, your journey\nstarts now.` : 'Your journey starts now.'}
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize['2xl'], lineHeight: 24 }}
          color={colors.mutedForeground}
        >
          Go from dreaming to doing.{'\n'}We&apos;ll celebrate every step.
        </ThemedText>
      </View>

      {/* Gabby quote */}
      <MaterialCard
        variant="tinted"
        style={{
          paddingVertical: Spacing.xl,
          paddingHorizontal: Spacing['2xl'],
          alignSelf: 'stretch',
        }}
      >
        <ThemedText
          style={{
            textAlign: 'center',
            fontSize: FontSize['3xl'],
            color: colors.accent,
            marginBottom: Spacing.xs,
          }}
        >
          &ldquo;
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic', lineHeight: 22 }}
        >
          Give yourself permission to live in your possibilities.
        </ThemedText>
        <ThemedText
          style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.md }}
          color={colors.mutedForeground}
        >
          — Gabby
        </ThemedText>
      </MaterialCard>

      {/* Tagline chips */}
      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.md,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {CHIPS.map((chip) => (
          <View
            key={chip.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
              backgroundColor: colors.surfaceTinted,
              borderRadius: Radius.full,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderWidth: 1,
              borderColor: colors.borderAccent,
            }}
          >
            <IconSymbol name={chip.icon} size={IconSize.lg} color={colors.accent} />
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.accent}>
              {chip.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}
