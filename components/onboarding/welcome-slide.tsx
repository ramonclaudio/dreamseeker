import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function WelcomeSlide({ colors }: { colors: SlideColors }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <View style={{
        padding: 4,
        borderRadius: Radius['3xl'],
        backgroundColor: `${colors.accentBlue}20`,
        shadowColor: colors.accentBlue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      }}>
        <Image
          source={require('@/assets/image-0.webp')}
          style={{ width: 200, height: 200, borderRadius: Radius['2xl'] }}
          contentFit="cover"
          accessible={true}
          accessibilityLabel="Woman looking towards the horizon, representing new beginnings"
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
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize.lg, fontWeight: '600' }}
          color={colors.accentBlue}
        >
          Join 2,000+ women already chasing their dreams
        </ThemedText>
      </View>
    </View>
  );
}
