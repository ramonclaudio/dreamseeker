import { useState, useEffect } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAction } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

function SettingRow({ icon, label, description, children, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description?: string;
  children?: React.ReactNode;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowLeft}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={styles.settingRowText}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
          {description && (
            <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>{description}</Text>
          )}
        </View>
      </View>
      {children}
    </View>
  );
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const sendTestNotification = useAction(api.notifications.sendTestNotification);

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  const requestPermission = async () => {
    if (!Device.isDevice) {
      Alert.alert('Device Required', 'Push notifications require a physical device.');
      return;
    }

    setIsLoading(true);
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === 'denied') {
        Alert.alert(
          'Permission Denied',
          'Push notifications are disabled. Please enable them in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      setPermissionStatus(status);
      haptics.success();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!Device.isDevice) {
      Alert.alert('Device Required', 'Push notifications require a physical device.');
      return;
    }

    setIsSendingTest(true);
    haptics.light();

    try {
      const result = await sendTestNotification();
      if (result.success) {
        Alert.alert('Success', 'Test notification sent! Check your device.');
      } else {
        Alert.alert('Error', result.error ?? 'Failed to send test notification.');
      }
    } catch {
      Alert.alert('Error', 'Failed to send test notification.');
    } finally {
      setIsSendingTest(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const isEnabled = permissionStatus === 'granted';
  const isSimulator = !Device.isDevice;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Push Notifications</Text>
        <GlassCard style={styles.card}>
          <SettingRow
            icon="bell.fill"
            label="Allow Notifications"
            description={isSimulator ? 'Requires physical device' : 'Receive alerts and updates'}
            colors={colors}>
            <Switch
              value={isEnabled}
              onValueChange={() => {
                haptics.light();
                if (isEnabled) {
                  Linking.openSettings();
                } else {
                  requestPermission();
                }
              }}
              disabled={isLoading || isSimulator}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? colors.background : undefined}
            />
          </SettingRow>
        </GlassCard>
      </View>

      {isEnabled && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Test</Text>
          <GlassCard style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.testButton, { opacity: pressed || isSendingTest ? 0.7 : 1 }]}
              onPress={handleTestNotification}
              disabled={isSendingTest}>
              <View style={styles.settingRowLeft}>
                <IconSymbol name="paperplane.fill" size={22} color={colors.primary} />
                <View style={styles.settingRowText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {isSendingTest ? 'Sending...' : 'Send Test Notification'}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                    Verify notifications are working
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </GlassCard>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>About</Text>
        <GlassCard style={styles.card}>
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Push notifications keep you informed about important updates, task reminders, and account activity.
              {'\n\n'}
              You can manage notification preferences in your device settings at any time.
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
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingRowText: { flex: 1 },
  settingLabel: { fontSize: 16 },
  settingDescription: { fontSize: 13, marginTop: 2 },
  testButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  infoContainer: { padding: 16 },
  infoText: { fontSize: 14, lineHeight: 20 },
});
