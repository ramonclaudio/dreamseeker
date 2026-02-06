import { View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import type { SlideColors } from './shared';

export function MeetGabbySlide({ colors }: { colors: SlideColors }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('@/assets/image-1.webp')}
          style={{ width: 120, height: 120 }}
          contentFit="cover"
          accessible={true}
          accessibilityLabel="Gabby, your AI dream coach"
        />
      </View>
      <View style={{ gap: Spacing.md }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Meet Gabby
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;Hi, I&apos;m Gabby. I built this app for women like you—smart, ambitious women who
            want to live big, bold lives of adventure.&quot;
          </ThemedText>
        </MaterialCard>
      </View>
    </View>
  );
}
