import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Typography } from '@/constants/theme';
import { useColorScheme, useThemeMode, type ThemeMode } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';

function SettingsItem({ icon, label, onPress, destructive, showChevron = true, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsItem, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <IconSymbol
          name={icon}
          size={22}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
        <Text style={[styles.settingsItemLabel, { color: destructive ? colors.destructive : colors.text }]}>
          {label}
        </Text>
      </View>
      {showChevron && <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

function SettingsSection({ title, children, colors }: { title?: string; children: React.ReactNode; colors: (typeof Colors)['light'] }) {
  return (
    <View style={styles.section}>
      {title && <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>}
      <GlassCard style={styles.sectionContent}>
        {children}
      </GlassCard>
    </View>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function ThemePicker({ mode, onModeChange, colors }: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  colors: (typeof Colors)['light'];
}) {
  const colorScheme = useColorScheme();
  const icon = colorScheme === 'dark' ? 'moon.fill' : 'sun.max.fill';
  return (
    <View style={styles.themeContainer}>
      <View style={styles.themeRow}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <Text style={[styles.settingsItemLabel, { color: colors.text }]}>Theme</Text>
      </View>
      <View style={[styles.segmentedControl, { backgroundColor: colors.muted }]}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.segment,
                isSelected && [styles.segmentSelected, { backgroundColor: colors.background }],
              ]}
              onPress={() => {
                haptics.light();
                onModeChange(option.value);
              }}>
              <Text style={[styles.segmentText, { color: isSelected ? colors.foreground : colors.mutedForeground }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SubscriptionSectionContent({ colors }: { colors: (typeof Colors)['light'] }) {
  const {
    tier,
    tierName,
    taskCount,
    taskLimit,
    subscription,
    isActive,
    isTrialing,
    isCanceled,
    isLoading,
    loading,
    showUpgrade,
    manageBilling,
    restore,
  } = useSubscription();

  const handleUpgrade = () => {
    haptics.medium();
    showUpgrade();
  };

  const handleManage = async () => {
    haptics.light();
    await manageBilling();
  };

  const handleRestore = async () => {
    haptics.medium();
    const result = await restore();
    if (result.error) {
      const message = result.error instanceof Error ? result.error.message : 'Failed to restore subscription';
      Alert.alert('Error', message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.subscriptionContainer}>
        <ActivityIndicator color={colors.mutedForeground} />
      </View>
    );
  }

  if (isActive) {
    const periodEnd = subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()
      : null;
    const isPro = tier === 'pro';

    return (
      <View style={styles.subscriptionContainer}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <IconSymbol name="star.fill" size={22} color={colors.primary} />
            <Text style={[styles.settingsItemLabel, { color: colors.text }]}>
              {isTrialing ? `${tierName} (Trial)` : `${tierName} Plan`}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Active</Text>
          </View>
        </View>

        {isCanceled ? (
          <>
            <Text style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
              Cancels on {periodEnd}
            </Text>
            <Pressable
              style={[styles.subscriptionButton, { backgroundColor: colors.primary }]}
              onPress={handleRestore}
              disabled={loading}>
              <Text style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
                {loading ? 'Restoring...' : 'Restore Subscription'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
              {isTrialing ? `Trial ends ${periodEnd}` : `Renews ${periodEnd}`}
            </Text>
            <View style={styles.buttonRow}>
              {!isPro && (
                <Pressable
                  style={[styles.subscriptionButton, styles.buttonFlex, { backgroundColor: colors.primary }]}
                  onPress={handleUpgrade}>
                  <Text style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
                    Upgrade
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.subscriptionButton,
                  styles.buttonFlex,
                  { borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={handleManage}
                disabled={loading}>
                <Text style={[styles.subscriptionButtonText, { color: colors.foreground }]}>
                  {loading ? 'Loading...' : 'Manage'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    );
  }

  const usageText = taskLimit !== null
    ? `${taskCount}/${taskLimit} tasks used`
    : `${taskCount} tasks`;

  return (
    <View style={styles.subscriptionContainer}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <IconSymbol name="gift" size={22} color={colors.mutedForeground} />
          <Text style={[styles.settingsItemLabel, { color: colors.text }]}>{tierName} Plan</Text>
        </View>
      </View>
      <Text style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
        {usageText} · Upgrade for more features
      </Text>

      <Pressable
        style={[styles.subscriptionButton, { backgroundColor: colors.primary }]}
        onPress={handleUpgrade}>
        <Text style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
          Upgrade
        </Text>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { mode, setMode } = useThemeMode();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleSignOut = () => {
    haptics.medium();
    authClient.signOut();
  };

  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await authClient.signOut();
    } catch (error) {
      setIsDeleting(false);
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      if (process.env.EXPO_OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    haptics.warning();
    const message =
      'Are you sure you want to delete your account? This will permanently delete all your data including tasks, sessions, and profile information. This action cannot be undone.';

    if (process.env.EXPO_OS === 'web') {
      if (window.confirm(message)) {
        performDeleteAccount();
      }
    } else {
      Alert.alert('Delete Account', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDeleteAccount,
        },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[Typography.title, { color: colors.text }]}>Settings</Text>
      </View>

      <SettingsSection title="Theme" colors={colors}>
        <ThemePicker mode={mode} onModeChange={setMode} colors={colors} />
      </SettingsSection>

      <SettingsSection title="Subscription" colors={colors}>
        <SubscriptionSectionContent colors={colors} />
      </SettingsSection>

      <SettingsSection title="Preferences" colors={colors}>
        <SettingsItem
          icon="bell.fill"
          label="Notifications"
          onPress={() => {
            haptics.light();
            router.navigate('/settings/notifications');
          }}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsItem
          icon="hand.raised.fill"
          label="Privacy"
          onPress={() => {
            haptics.light();
            router.navigate('/settings/privacy');
          }}
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Support" colors={colors}>
        <SettingsItem
          icon="questionmark.circle.fill"
          label="Help"
          onPress={() => {
            haptics.light();
            router.navigate('/settings/help');
          }}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsItem
          icon="info.circle.fill"
          label="About"
          onPress={() => {
            haptics.light();
            router.navigate('/settings/about');
          }}
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Account" colors={colors}>
        <SettingsItem
          icon="rectangle.portrait.and.arrow.right"
          label="Sign Out"
          onPress={handleSignOut}
          showChevron={false}
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Danger Zone" colors={colors}>
        {isDeleting ? (
          <View style={styles.deletingContainer}>
            <ActivityIndicator color={colors.destructive} />
            <Text style={[styles.deletingText, { color: colors.destructive }]}>
              Deleting account...
            </Text>
          </View>
        ) : (
          <SettingsItem
            icon="trash.fill"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
            showChevron={false}
            colors={colors}
          />
        )}
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, opacity: 0.6 },
  sectionContent: { borderRadius: Radius.lg, borderCurve: 'continuous', overflow: 'hidden' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsItemLabel: { fontSize: 16 },
  themeContainer: { padding: 16, gap: 12 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  segmentedControl: { flexDirection: 'row', borderRadius: Radius.md, borderCurve: 'continuous', padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm, borderCurve: 'continuous' },
  segmentSelected: { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' },
  segmentText: { fontSize: 14, fontWeight: '500' },
  deletingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  deletingText: { fontSize: 16, fontWeight: '500' },
  subscriptionContainer: { padding: 16, gap: 12 },
  subscriptionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subscriptionInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subscriptionDetail: { fontSize: 14 },
  subscriptionButton: { paddingVertical: 12, borderRadius: Radius.md, borderCurve: 'continuous', alignItems: 'center', marginTop: 4 },
  subscriptionButtonText: { fontSize: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  buttonFlex: { flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderCurve: 'continuous' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
});
