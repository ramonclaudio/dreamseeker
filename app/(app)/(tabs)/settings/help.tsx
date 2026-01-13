import { Alert, Linking, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

function HelpItem({ icon, label, description, onPress, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  onPress?: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.itemRow, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}>
      <View style={styles.itemLeft}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={styles.itemText}>
          <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.itemDescription, { color: colors.mutedForeground }]}>{description}</Text>
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
    <View style={styles.faqItem}>
      <Text style={[styles.faqQuestion, { color: colors.text }]}>{question}</Text>
      <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{answer}</Text>
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
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Contact</Text>
        <GlassCard style={styles.card}>
          <HelpItem
            icon="envelope.fill"
            label="Email Support"
            description="Get help via email"
            onPress={handleOpenEmail}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <HelpItem
            icon="exclamationmark.bubble.fill"
            label="Report an Issue"
            description="Open a GitHub issue"
            onPress={handleOpenGitHub}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>FAQ</Text>
        <GlassCard style={styles.card}>
          <FAQItem
            question="How do I upgrade my subscription?"
            answer="Go to Settings → Subscription and tap Upgrade to see available plans."
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <FAQItem
            question="How do I delete my account?"
            answer="Go to Settings → Delete Account. This will permanently remove all your data."
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, opacity: 0.6 },
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 16 },
  itemDescription: { fontSize: 13, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
  faqItem: { padding: 16 },
  faqQuestion: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  faqAnswer: { fontSize: 14, lineHeight: 20 },
});
