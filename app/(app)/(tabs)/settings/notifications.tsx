import { useState, useEffect } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAction } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { MaterialCard } from '@/components/ui/material-card';
import { GlassSwitch } from '@/components/ui/glass-switch';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, type ColorPalette } from '@/constants/theme';
import { FontSize, IconSize, MaxWidth, Spacing, TouchTarget } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const sectionStyle = { marginTop: Spacing['2xl'], paddingHorizontal: Spacing.xl, gap: Spacing.sm };
const sectionTitleStyle = { fontSize: FontSize.md, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginLeft: Spacing.xs, opacity: 0.6 };
const cardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };
const settingRowLeftStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.md, flex: 1 };
const settingRowTextStyle = { flex: 1, gap: Spacing.xs / 2 };

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

function SettingRow({ icon, label, description, children, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description?: string;
  children?: React.ReactNode;
  colors: ColorPalette;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg }}>
      <View style={settingRowLeftStyle}>
        <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
        <View style={settingRowTextStyle}>
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
          {description && (
            <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>{description}</ThemedText>
          )}
        </View>
      </View>
      {children}
    </View>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
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
        Alert.alert('Notification Sent', 'Check your device for the test notification.');
      } else {
        Alert.alert('Notification Failed', result.error ?? 'Unable to send test notification. Please try again.');
      }
    } catch {
      Alert.alert('Notification Failed', 'Unable to send test notification. Please try again.');
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
      contentContainerStyle={{ paddingBottom: Spacing['4xl'], maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
      contentInsetAdjustmentBehavior="automatic">
      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Push Notifications</ThemedText>
        <MaterialCard style={cardStyle}>
          <SettingRow
            icon="bell.fill"
            label="Allow Notifications"
            description={isSimulator ? 'Requires physical device' : 'Receive alerts and updates'}
            colors={colors}>
            <GlassSwitch
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
            />
          </SettingRow>
        </MaterialCard>
      </View>

      {isEnabled && (
        <View style={sectionStyle}>
          <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Test</ThemedText>
          <MaterialCard style={cardStyle}>
            <Pressable
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, minHeight: TouchTarget.min }, { opacity: pressed || isSendingTest ? Opacity.pressed : 1 }]}
              onPress={handleTestNotification}
              disabled={isSendingTest}
              accessibilityRole="button"
              accessibilityLabel={isSendingTest ? 'Sending test notification' : 'Send test notification'}
              accessibilityState={{ disabled: isSendingTest }}>
              <View style={settingRowLeftStyle}>
                <IconSymbol name="paperplane.fill" size={IconSize['2xl']} color={colors.primary} />
                <View style={settingRowTextStyle}>
                  <ThemedText style={{ fontSize: FontSize.xl }}>
                    {isSendingTest ? 'Sending...' : 'Send Test Notification'}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
                    Verify notifications are working
                  </ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
            </Pressable>
          </MaterialCard>
        </View>
      )}

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>About</ThemedText>
        <MaterialCard style={cardStyle}>
          <View style={{ padding: Spacing.lg }}>
            <ThemedText style={{ fontSize: FontSize.base, lineHeight: 20 }} color={colors.mutedForeground}>
              Push notifications keep you informed about important updates, task reminders, and account activity.
              {'\n\n'}
              You can manage notification preferences in your device settings at any time.
            </ThemedText>
          </View>
        </MaterialCard>
      </View>
    </ScrollView>
  );
}
