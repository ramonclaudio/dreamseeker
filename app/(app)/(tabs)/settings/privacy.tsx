import { Linking, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

function PrivacyItem({ icon, label, description, onPress, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  onPress?: () => void;
  colors: (typeof Colors)['light'];
}) {
  const content = (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={styles.itemText}>
          <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.itemDescription, { color: colors.mutedForeground }]}>{description}</Text>
        </View>
      </View>
      {onPress && <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={() => {
          haptics.light();
          onPress();
        }}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Device Permissions</Text>
        <GlassCard style={styles.card}>
          <PrivacyItem
            icon="camera.fill"
            label="Camera & Photos"
            description="Used for profile avatar"
            onPress={handleOpenSettings}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="bell.fill"
            label="Notifications"
            description="Push notification access"
            onPress={handleOpenSettings}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Data Collection</Text>
        <GlassCard style={styles.card}>
          <PrivacyItem
            icon="person.fill"
            label="Account Data"
            description="Name, email, and profile information"
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="checklist"
            label="Task Data"
            description="Your tasks and completion history"
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="creditcard.fill"
            label="Payment Data"
            description="Handled securely by Stripe"
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Your Rights</Text>
        <GlassCard style={styles.card}>
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              You can request a copy of your data or delete your account at any time from Settings → Delete Account.
              {'\n\n'}
              We do not sell your personal information to third parties.
            </Text>
          </View>
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
  infoContainer: { padding: 16 },
  infoText: { fontSize: 14, lineHeight: 20 },
});
