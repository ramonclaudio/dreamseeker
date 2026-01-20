import { View, ScrollView, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/ui/glass-card';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const featureItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 };

export default function EarlyAccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ width: 36, height: 5, borderRadius: 3, marginBottom: 12, backgroundColor: 'rgba(128,128,128,0.3)' }} />
        <Text style={[Typography.subtitle, { color: colors.text }]}>Early Access</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }} contentInsetAdjustmentBehavior="automatic">
        <GlassCard style={{ padding: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="sparkles" size={16} color={colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.primary }}>Pro Feature</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground }}>Early Access Features</Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.mutedForeground }}>
            As a Pro subscriber, you get early access to new features before they&apos;re released to everyone.
          </Text>
        </GlassCard>

        <GlassCard style={{ padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Coming Soon</Text>
          {[
            'AI-powered task suggestions',
            'Advanced analytics dashboard',
            'Team collaboration',
            'Custom integrations',
          ].map((text) => (
            <View key={text} style={featureItemStyle}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
              <Text style={{ fontSize: 16, color: colors.foreground }}>{text}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}
