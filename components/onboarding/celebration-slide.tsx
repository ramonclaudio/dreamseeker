import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function CelebrationSlide({ colors }: { colors: SlideColors }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <View
        style={{
          width: 140,
          height: 140,
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
          style={{ width: 120, height: 120 }}
          contentFit="contain"
          accessible={true}
          accessibilityLabel="DreamSeeker cloud icon"
        />
      </View>
      <View style={{ gap: Spacing.lg, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Welcome to DreamSeeker!
        </ThemedText>
        <MaterialCard
          variant="elevated"
          style={{
            padding: Spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: colors.accent,
          }}
        >
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;You just took your first step. You&apos;re no longer just dreaming—you&apos;re
            SEEKING. Seek risk. Seize opportunity. See the world.&quot;
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm }}
            color={colors.mutedForeground}
          >
            — Gabby
          </ThemedText>
        </MaterialCard>
        <ThemedText
          style={{ fontSize: FontSize.base, textAlign: 'center' }}
          color={colors.mutedForeground}
        >
          Your journey starts now. Let&apos;s make it count.
        </ThemedText>
      </View>
    </View>
  );
}
