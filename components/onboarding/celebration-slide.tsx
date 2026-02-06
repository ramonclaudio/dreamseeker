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
      <Image
        source={require('@/assets/image-6.webp')}
        style={{ width: 200, height: 200, borderRadius: Radius['2xl'] }}
        contentFit="cover"
        accessible={true}
        accessibilityLabel="Celebration confetti and achievement"
      />
      <View style={{ gap: Spacing.lg, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Welcome to DreamSeeker!
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
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
      </View>
    </View>
  );
}
