import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';


export function ProblemSlide({ colors }: { colors: SlideColors }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <Image
        source={require('@/assets/image-2.webp')}
        style={{ width: 180, height: 180, borderRadius: Radius['2xl'] }}
        contentFit="cover"
        accessible={true}
        accessibilityLabel="Illustration representing the challenge of achieving goals"
      />
      <View style={{ gap: Spacing.lg }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          The Gap
        </ThemedText>
        <MaterialCard variant="tinted" style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;There&apos;s a massive gap between inspiration and action. Sometimes we get stuck
            waiting for permission... waiting to feel confident... waiting for a sign.&quot;
          </ThemedText>
        </MaterialCard>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize.lg }}
          color={colors.mutedForeground}
        >
          DreamSeeker bridges that gap with small, daily actions that build unstoppable momentum.
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize.base, fontWeight: '500' }}
          color={colors.primary}
        >
          Setting goals doesn&apos;t have to feel overwhelming. We&apos;ll start small.
        </ThemedText>
      </View>
    </View>
  );
}
