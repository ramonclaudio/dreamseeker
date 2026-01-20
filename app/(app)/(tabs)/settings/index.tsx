import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useMutation } from 'convex/react';
import * as Clipboard from 'expo-clipboard';

import { api } from '@/convex/_generated/api';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, type ColorPalette } from '@/constants/theme';
import { MaxWidth, Spacing, TouchTarget, FontSize, IconSize } from '@/constants/layout';
import { Opacity, Shadow, Size } from '@/constants/ui';
import { useColorScheme, useColors, useThemeMode, type ThemeMode } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';

const sectionStyle = { marginTop: Spacing['2xl'], paddingHorizontal: Spacing.xl, gap: Spacing.sm };
const sectionTitleStyle = { fontSize: FontSize.md, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginLeft: Spacing.xs, opacity: 0.6 };
const sectionContentStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };
const settingsItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: Spacing.lg, minHeight: TouchTarget.min };
const settingsItemLeftStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.md };
const dividerStyle = { height: Size.divider, marginLeft: Size.dividerMargin };
const subscriptionContainerStyle = { padding: Spacing.lg, gap: Spacing.md };
const subscriptionHeaderStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const };
const subscriptionInfoStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.md };
const buttonRowStyle = { flexDirection: 'row' as const, gap: Spacing.sm };

function SettingsItem({ icon, label, onPress, destructive, showChevron = true, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  colors: ColorPalette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [settingsItemStyle, { opacity: pressed ? Opacity.pressed : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={settingsItemLeftStyle}>
        <IconSymbol
          name={icon}
          size={IconSize['2xl']}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
        <ThemedText style={{ fontSize: FontSize.xl }} color={destructive ? colors.destructive : colors.text}>
          {label}
        </ThemedText>
      </View>
      {showChevron && <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />}
    </Pressable>
  );
}

function SettingsLinkItem({ href, icon, label, colors }: {
  href: '/settings/notifications' | '/settings/privacy' | '/settings/help' | '/settings/about';
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  colors: ColorPalette;
}) {
  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(href);
    haptics.light();
  };

  if (Platform.OS !== 'ios') {
    return (
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [settingsItemStyle, { opacity: pressed ? Opacity.pressed : 1 }]}
          accessibilityRole="link"
          accessibilityLabel={label}>
          <View style={settingsItemLeftStyle}>
            <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
            <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={href} style={settingsItemStyle}>
      <Link.Trigger>
        <View style={settingsItemLeftStyle}>
          <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
        </View>
      </Link.Trigger>
      <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction
          title="Copy Link"
          icon="doc.on.doc"
          onPress={handleCopyLink}
        />
      </Link.Menu>
    </Link>
  );
}

function SettingsSection({ title, children, colors }: { title?: string; children: React.ReactNode; colors: ColorPalette }) {
  return (
    <View style={sectionStyle}>
      {title && <ThemedText style={sectionTitleStyle}>{title}</ThemedText>}
      <MaterialCard style={sectionContentStyle}>
        {children}
      </MaterialCard>
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
  colors: ColorPalette;
}) {
  const colorScheme = useColorScheme();
  const icon = colorScheme === 'dark' ? 'moon.fill' : 'sun.max.fill';
  return (
    <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
        <ThemedText style={{ fontSize: FontSize.xl }}>Theme</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', borderRadius: Radius.md, borderCurve: 'continuous', padding: Spacing.xxs, backgroundColor: colors.muted }}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                { flex: 1, paddingVertical: Spacing.md, minHeight: TouchTarget.min, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, borderCurve: 'continuous' },
                isSelected && { boxShadow: `${Shadow.sm} ${colors.shadow}`, backgroundColor: colors.background },
              ]}
              onPress={() => {
                haptics.light();
                onModeChange(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityState={{ selected: isSelected }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: '500' }} color={isSelected ? colors.foreground : colors.mutedForeground}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SubscriptionSectionContent({ colors }: { colors: ColorPalette }) {
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
      const message = result.error instanceof Error ? result.error.message : 'Unable to restore subscription. Please try again.';
      Alert.alert('Restore Failed', message);
    }
  };

  const subscriptionButtonStyle = { paddingVertical: Spacing.md, minHeight: TouchTarget.min, justifyContent: 'center' as const, borderRadius: Radius.md, borderCurve: 'continuous' as const, alignItems: 'center' as const, marginTop: Spacing.xs };

  if (isLoading) {
    return (
      <View style={subscriptionContainerStyle}>
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
      <View style={subscriptionContainerStyle}>
        <View style={subscriptionHeaderStyle}>
          <View style={subscriptionInfoStyle}>
            <IconSymbol name="star.fill" size={IconSize['2xl']} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.xl }}>
              {isTrialing ? `${tierName} (Trial)` : `${tierName} Plan`}
            </ThemedText>
          </View>
          <View style={{ paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.primary + '20' }}>
            <ThemedText style={{ fontSize: FontSize.sm, fontWeight: '600' }} color={colors.primary}>Active</ThemedText>
          </View>
        </View>

        {isCanceled ? (
          <>
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              Cancels on {periodEnd}
            </ThemedText>
            <Pressable
              style={[subscriptionButtonStyle, { backgroundColor: colors.primary }]}
              onPress={handleRestore}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={loading ? 'Restoring subscription' : 'Restore subscription'}
              accessibilityState={{ disabled: loading }}>
              <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }} color={colors.primaryForeground}>
                {loading ? 'Restoring...' : 'Restore Subscription'}
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              {isTrialing ? `Trial ends ${periodEnd}` : `Renews ${periodEnd}`}
            </ThemedText>
            <View style={buttonRowStyle}>
              {!isPro && (
                <Pressable
                  style={[subscriptionButtonStyle, { flex: 1, backgroundColor: colors.primary }]}
                  onPress={handleUpgrade}
                  accessibilityRole="button"
                  accessibilityLabel="Upgrade subscription">
                  <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }} color={colors.primaryForeground}>
                    Upgrade
                  </ThemedText>
                </Pressable>
              )}
              <Pressable
                style={[subscriptionButtonStyle, { flex: 1, borderColor: colors.border, borderWidth: 1 }]}
                onPress={handleManage}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={loading ? 'Loading billing' : 'Manage subscription'}
                accessibilityState={{ disabled: loading }}>
                <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }}>
                  {loading ? 'Loading...' : 'Manage'}
                </ThemedText>
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
    <View style={subscriptionContainerStyle}>
      <View style={subscriptionHeaderStyle}>
        <View style={subscriptionInfoStyle}>
          <IconSymbol name="gift" size={IconSize['2xl']} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: FontSize.xl }}>{tierName} Plan</ThemedText>
        </View>
      </View>
      <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
        {usageText} · Upgrade for more features
      </ThemedText>

      <Pressable
        style={[subscriptionButtonStyle, { backgroundColor: colors.primary }]}
        onPress={handleUpgrade}
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Pro">
        <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }} color={colors.primaryForeground}>
          Upgrade
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
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
      const message = error instanceof Error ? error.message : 'Unable to delete account. Please try again.';
      if (process.env.EXPO_OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Deletion Failed', message);
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
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Spacing['4xl'], maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
      contentInsetAdjustmentBehavior="automatic">
      <SettingsSection title="Theme" colors={colors}>
        <ThemePicker mode={mode} onModeChange={setMode} colors={colors} />
      </SettingsSection>

      <SettingsSection title="Subscription" colors={colors}>
        <SubscriptionSectionContent colors={colors} />
      </SettingsSection>

      <SettingsSection title="Preferences" colors={colors}>
        <SettingsLinkItem
          href="/settings/notifications"
          icon="bell.fill"
          label="Notifications"
          colors={colors}
        />
        <View style={[dividerStyle, { backgroundColor: colors.border }]} />
        <SettingsLinkItem
          href="/settings/privacy"
          icon="hand.raised.fill"
          label="Privacy"
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Support" colors={colors}>
        <SettingsLinkItem
          href="/settings/help"
          icon="questionmark.circle.fill"
          label="Help"
          colors={colors}
        />
        <View style={[dividerStyle, { backgroundColor: colors.border }]} />
        <SettingsLinkItem
          href="/settings/about"
          icon="info.circle.fill"
          label="About"
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.md }}>
            <ActivityIndicator color={colors.destructive} />
            <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '500' }} color={colors.destructive}>
              Deleting account...
            </ThemedText>
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
