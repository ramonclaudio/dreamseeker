import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { useAppearance, type AppearanceMode } from '@/providers/appearance-provider';

type SettingsItemProps = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  colors: (typeof Colors)['light'];
};

function SettingsItem({ icon, label, onPress, destructive, colors }: SettingsItemProps) {
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
        <ThemedText
          style={[styles.settingsItemLabel, destructive && { color: colors.destructive }]}>
          {label}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

type SettingsSectionProps = {
  title?: string;
  children: React.ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      {title && <ThemedText style={styles.sectionTitle}>{title}</ThemedText>}
      <GlassCard style={styles.sectionContent}>
        {children}
      </GlassCard>
    </View>
  );
}

const APPEARANCE_OPTIONS: { value: AppearanceMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type AppearancePickerProps = {
  mode: AppearanceMode;
  onModeChange: (mode: AppearanceMode) => void;
  colors: (typeof Colors)['light'];
  colorScheme: 'light' | 'dark';
};

function AppearancePicker({ mode, onModeChange, colors, colorScheme }: AppearancePickerProps) {
  const icon = colorScheme === 'dark' ? 'moon.fill' : 'sun.max.fill';
  return (
    <View style={styles.appearanceContainer}>
      <View style={styles.appearanceRow}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <ThemedText style={styles.settingsItemLabel}>Appearance</ThemedText>
      </View>
      <View style={[styles.segmentedControl, { backgroundColor: colors.muted }]}>
        {APPEARANCE_OPTIONS.map((option) => {
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
              <ThemedText
                style={[
                  styles.segmentText,
                  { color: isSelected ? colors.foreground : colors.mutedForeground },
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type SubscriptionSectionContentProps = {
  colors: (typeof Colors)['light'];
};

function SubscriptionSectionContent({ colors }: SubscriptionSectionContentProps) {
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
    canAccess,
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

  // Active subscription
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
            <ThemedText style={styles.settingsItemLabel}>
              {isTrialing ? `${tierName} (Trial)` : `${tierName} Plan`}
            </ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>Active</ThemedText>
          </View>
        </View>

        {isCanceled ? (
          <>
            <ThemedText style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
              Cancels on {periodEnd}
            </ThemedText>
            <Pressable
              style={[styles.subscriptionButton, { backgroundColor: colors.primary }]}
              onPress={handleRestore}
              disabled={loading}>
              <ThemedText style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
                {loading ? 'Restoring...' : 'Restore Subscription'}
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
              {isTrialing ? `Trial ends ${periodEnd}` : `Renews ${periodEnd}`}
            </ThemedText>
            <View style={styles.buttonRow}>
              {!isPro && (
                <Pressable
                  style={[styles.subscriptionButton, styles.buttonFlex, { backgroundColor: colors.primary }]}
                  onPress={handleUpgrade}>
                  <ThemedText style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
                    Upgrade
                  </ThemedText>
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
                <ThemedText style={[styles.subscriptionButtonText, { color: colors.foreground }]}>
                  {loading ? 'Loading...' : 'Manage'}
                </ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </View>
    );
  }

  // No subscription - show upgrade button
  const usageText = taskLimit !== null
    ? `${taskCount}/${taskLimit} tasks used`
    : `${taskCount} tasks`;

  return (
    <View style={styles.subscriptionContainer}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <IconSymbol name="gift" size={22} color={colors.mutedForeground} />
          <ThemedText style={styles.settingsItemLabel}>{tierName} Plan</ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.subscriptionDetail, { color: colors.mutedForeground }]}>
        {usageText} · Upgrade for more features
      </ThemedText>

      <Pressable
        style={[styles.subscriptionButton, { backgroundColor: colors.primary }]}
        onPress={handleUpgrade}>
        <ThemedText style={[styles.subscriptionButtonText, { color: colors.primaryForeground }]}>
          Upgrade
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { mode, setMode } = useAppearance();
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
      // Sign out to clear local auth state
      await authClient.signOut();
    } catch (error) {
      setIsDeleting(false);
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      if (Platform.OS === 'web') {
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

    if (Platform.OS === 'web') {
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
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <SettingsSection title="Appearance">
        <AppearancePicker mode={mode} onModeChange={setMode} colors={colors} colorScheme={colorScheme} />
      </SettingsSection>

      <SettingsSection title="Subscription">
        <SubscriptionSectionContent colors={colors} />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsItem
          icon="rectangle.portrait.and.arrow.right"
          label="Sign Out"
          onPress={handleSignOut}
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Danger Zone">
        {isDeleting ? (
          <View style={styles.deletingContainer}>
            <ActivityIndicator color={colors.destructive} />
            <ThemedText style={[styles.deletingText, { color: colors.destructive }]}>
              Deleting account...
            </ThemedText>
          </View>
        ) : (
          <SettingsItem
            icon="trash.fill"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
            colors={colors}
          />
        )}
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.6,
  },
  sectionContent: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 16,
  },
  appearanceContainer: {
    padding: 16,
    gap: 12,
  },
  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  deletingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionContainer: {
    padding: 16,
    gap: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionDetail: {
    fontSize: 14,
  },
  subscriptionButton: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonFlex: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
