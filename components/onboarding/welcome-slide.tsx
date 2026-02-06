import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { SlideColors } from './shared';

export function WelcomeSlide({ colors }: { colors: SlideColors }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <Image
        source={require('@/assets/image-0.webp')}
        style={{ width: 200, height: 200, borderRadius: Radius['2xl'] }}
        contentFit="cover"
        accessible={true}
        accessibilityLabel="Woman looking towards the horizon, representing new beginnings"
      />
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
      </View>
    </View>
  );
}
