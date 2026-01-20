import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const dividerStyle = { height: 0.5, marginLeft: 50 };
const faqItemStyle = { padding: 16, gap: 4 };
const faqQuestionStyle = { fontSize: 16, fontWeight: '500' as const };
const faqAnswerStyle = { fontSize: 14, lineHeight: 20 };

function HelpItem({ icon, label, description, onPress, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  onPress?: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={{ fontSize: 16 }}>{label}</ThemedText>
          <ThemedText style={{ fontSize: 13 }} color={colors.mutedForeground}>{description}</ThemedText>
        </View>
      </View>
      <IconSymbol name="arrow.up.right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function FAQItem({ question, answer, colors }: {
  question: string;
  answer: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={faqItemStyle}>
      <ThemedText style={faqQuestionStyle}>{question}</ThemedText>
      <ThemedText style={faqAnswerStyle} color={colors.mutedForeground}>{answer}</ThemedText>
    </View>
  );
}

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/ramonclaudio/expo-starter-app/issues');
  };

  const handleOpenEmail = async () => {
    const url = 'mailto:hello@ramonclaudio.com?subject=App Support';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('No Email App', 'Please configure an email app or contact hello@ramonclaudio.com');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic">
      <View style={{ marginTop: 24, paddingHorizontal: 20, gap: 8 }}>
        <ThemedText style={{ fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginLeft: 4, opacity: 0.6 }} color={colors.mutedForeground}>Contact</ThemedText>
        <GlassCard style={{ borderRadius: Radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
          <HelpItem
            icon="envelope.fill"
            label="Email Support"
            description="Get help via email"
            onPress={handleOpenEmail}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <HelpItem
            icon="exclamationmark.bubble.fill"
            label="Report an Issue"
            description="Open a GitHub issue"
            onPress={handleOpenGitHub}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={{ marginTop: 24, paddingHorizontal: 20, gap: 8 }}>
        <ThemedText style={{ fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginLeft: 4, opacity: 0.6 }} color={colors.mutedForeground}>FAQ</ThemedText>
        <GlassCard style={{ borderRadius: Radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
          <FAQItem
            question="How do I upgrade my subscription?"
            answer="Go to Settings → Subscription and tap Upgrade to see available plans."
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <FAQItem
            question="How do I delete my account?"
            answer="Go to Settings → Delete Account. This will permanently remove all your data."
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <FAQItem
            question="Why aren't notifications working?"
            answer="Make sure notifications are enabled in Settings → Notifications. You must use a physical device."
            colors={colors}
          />
        </GlassCard>
      </View>
    </ScrollView>
  );
}
