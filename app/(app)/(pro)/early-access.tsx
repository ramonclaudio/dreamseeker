import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { MaxWidth, Spacing, FontSize, IconSize } from '@/constants/layout';
import { Size } from '@/constants/ui';

const featureItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.md };

export default function EarlyAccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.lg }}>
        <View style={{ width: Size.dragHandle.width, height: Size.dragHandle.height, borderRadius: Size.dragHandle.radius, marginBottom: Spacing.md, backgroundColor: colors.separator }} />
        <ThemedText variant="subtitle">Early Access</ThemedText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xl, paddingBottom: Math.max(Spacing.xl, insets.bottom), gap: Spacing.xl, maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }} contentInsetAdjustmentBehavior="automatic">
        <GlassCard style={{ padding: Spacing.xl, gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <IconSymbol name="sparkles" size={IconSize.md} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase' }} color={colors.primary}>Pro Feature</ThemedText>
          </View>
          <ThemedText style={{ fontSize: FontSize['5xl'], fontWeight: 'bold' }}>Early Access Features</ThemedText>
          <ThemedText style={{ fontSize: FontSize.xl, lineHeight: 24 }} color={colors.mutedForeground}>
            As a Pro subscriber, you get early access to new features before they&apos;re released to everyone.
          </ThemedText>
        </GlassCard>

        <GlassCard style={{ padding: Spacing.xl, gap: Spacing.lg }}>
          <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '600' }}>Coming Soon</ThemedText>
          {[
            'AI-powered task suggestions',
            'Advanced analytics dashboard',
            'Team collaboration',
            'Custom integrations',
          ].map((text) => (
            <View key={text} style={featureItemStyle}>
              <IconSymbol name="checkmark.circle.fill" size={IconSize.xl} color={colors.primary} />
              <ThemedText style={{ fontSize: FontSize.xl }}>{text}</ThemedText>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}
