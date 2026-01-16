import { useState, useEffect } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAction } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const sectionStyle = { marginTop: 24, paddingHorizontal: 20, gap: 8 };
const sectionTitleStyle = { fontSize: 13, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginLeft: 4, opacity: 0.6 };
const cardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };
const settingRowLeftStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, flex: 1 };
const settingRowTextStyle = { flex: 1, gap: 2 };

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

function SettingRow({ icon, label, description, children, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description?: string;
  children?: React.ReactNode;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <View style={settingRowLeftStyle}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={settingRowTextStyle}>
          <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
          {description && (
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{description}</Text>
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
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="automatic">
      <View style={sectionStyle}>
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>Push Notifications</Text>
        <GlassCard style={cardStyle}>
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
              thumbColor={process.env.EXPO_OS === 'android' ? colors.background : undefined}
            />
          </SettingRow>
        </GlassCard>
      </View>

      {isEnabled && (
        <View style={sectionStyle}>
          <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>Test</Text>
          <GlassCard style={cardStyle}>
            <Pressable
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }, { opacity: pressed || isSendingTest ? 0.7 : 1 }]}
              onPress={handleTestNotification}
              disabled={isSendingTest}>
              <View style={settingRowLeftStyle}>
                <IconSymbol name="paperplane.fill" size={22} color={colors.primary} />
                <View style={settingRowTextStyle}>
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {isSendingTest ? 'Sending...' : 'Send Test Notification'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                    Verify notifications are working
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </GlassCard>
        </View>
      )}

      <View style={sectionStyle}>
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>About</Text>
        <GlassCard style={cardStyle}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
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
