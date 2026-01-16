import { View, ScrollView, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/ui/glass-card';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const featureItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 };

export default function EarlyAccessScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleClose = () => {
    haptics.light();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16, paddingTop: insets.top + 8 }}>
        <View style={{ position: 'absolute', top: 8, width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)' }} />
        <Text style={[Typography.subtitle, { color: colors.text }]}>Early Access</Text>
        <Pressable onPress={handleClose} style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center', padding: 4 }}>
          <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
        <GlassCard style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <IconSymbol name="sparkles" size={16} color={colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.primary }}>Pro Feature</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: colors.foreground }}>Early Access Features</Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.mutedForeground }}>
            As a Pro subscriber, you get early access to new features before they&apos;re released to everyone.
          </Text>
        </GlassCard>

        <GlassCard style={{ padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4, color: colors.foreground }}>Coming Soon</Text>
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
