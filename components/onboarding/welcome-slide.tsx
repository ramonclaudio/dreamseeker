import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function WelcomeSlide({ colors }: { colors: SlideColors }) {
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
      <View style={{ gap: Spacing.md, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Ready to go from dreaming to doing?
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize['2xl'] }}
          color={colors.mutedForeground}
        >
          DreamSeeker helps ambitious women turn big dreams into daily actions.
        </ThemedText>
        <MaterialCard
          variant="tinted"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            marginTop: Spacing.sm,
          }}
        >
          <IconSymbol name="sparkles" size={IconSize.lg} color={colors.accent} />
          <ThemedText
            style={{ fontSize: FontSize.lg, fontWeight: '600' }}
            color={colors.accent}
          >
            Join 2,000+ women already chasing their dreams
          </ThemedText>
        </MaterialCard>
      </View>
    </View>
  );
}
