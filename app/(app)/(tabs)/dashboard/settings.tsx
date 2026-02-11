import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "convex/react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { ProfileField } from "@/components/profile/profile-field";
import { EditModal } from "@/components/profile/edit-modal";
import { ChangePasswordModal } from "@/components/profile/change-password-modal";
import { SubscriptionSection } from "@/components/profile/subscription-section";
import {
  SettingsSection,
  SettingsItem,
  SettingsLinkItem,
  settingsDividerStyle,
} from "@/components/profile/settings-section";
import { ThemePicker } from "@/components/profile/theme-picker";
import { MaterialCard } from "@/components/ui/material-card";
import { Radius } from "@/constants/theme";
import {
  Spacing,
  FontSize,
  IconSize,
  MaxWidth,
  TAB_BAR_CLEARANCE,
} from "@/constants/layout";
import { Size } from "@/constants/ui";
import { useColors, useThemeMode } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";
import { haptics } from "@/lib/haptics";
import { api } from "@/convex/_generated/api";
import { useSubscription } from "@/hooks/use-subscription";
import { router } from "expo-router";

export default function SettingsScreen() {
  const colors = useColors();
  const { mode, setMode } = useThemeMode();
  const user = useQuery(api.auth.getCurrentUser);
  const deleteAccountMutation = useMutation(api.users.deleteAccount);
  const resetOnboardingMutation = useMutation(api.userPreferences.resetOnboarding);
  const { isPremium, dreamLimit, dreamCount, isTrialActive, trialDaysRemaining, hasTrialExpired, showUpgrade, showCustomerCenter, restorePurchases } = useSubscription();

  type AccountEditField = "name" | "username" | "email" | null;
  const [editingField, setEditingField] = useState<AccountEditField>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateAccountField = async (field: NonNullable<AccountEditField>, value: string) => {
    if (field === "email") {
      const { error } = await authClient.changeEmail({ newEmail: value });
      if (error) { haptics.error(); throw new Error(error.message ?? "Failed to update email"); }
    } else {
      if (field === "username") {
        if (value.length < 3) { haptics.error(); throw new Error("Username must be at least 3 characters"); }
        if (value.length > 20) { haptics.error(); throw new Error("Username must be at most 20 characters"); }
      }
      const { error } = await authClient.updateUser({ [field]: value });
      if (error) {
        haptics.error();
        const message = error.message ?? "";
        if (field === "username" && message.toLowerCase().includes("already taken")) {
          throw new Error("Username is already taken");
        }
        throw new Error(message || `Failed to update ${field}`);
      }
    }
    haptics.success();
  };

  const handleSignOut = () => {
    haptics.medium();
    authClient.signOut();
  };

  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountMutation();
      await authClient.signOut();
    } catch (error) {
      setIsDeleting(false);
      const message =
        error instanceof Error ? error.message : "Unable to delete account. Please try again.";
      Alert.alert("Deletion Failed", message);
    }
  };

  const handleResetOnboarding = async () => {
    haptics.light();
    await resetOnboardingMutation();
    router.replace('/(app)/onboarding');
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    haptics.warning();
    const message =
      "Are you sure you want to delete your account? This will permanently delete all your data including dreams, sessions, and profile information. This action cannot be undone.";

    Alert.alert("Delete Account", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: performDeleteAccount },
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sectionStyle = { marginTop: Spacing["2xl"], paddingHorizontal: Spacing.xl, gap: Spacing.sm };
  const sectionTitleStyle = {
    fontSize: FontSize.md,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    marginLeft: Spacing.md,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_CLEARANCE,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={sectionStyle}>
          <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>
            Account
          </ThemedText>
          <MaterialCard style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
            <ProfileField label="Name" value={user.name || ""} onPress={() => { haptics.selection(); setEditingField("name"); }} colors={colors} />
            <View style={{ height: Size.dividerThick, marginLeft: Spacing.lg, backgroundColor: colors.border }} />
            <ProfileField label="Username" value={user.username ? `@${user.username}` : ""} onPress={() => { haptics.selection(); setEditingField("username"); }} colors={colors} />
            <View style={{ height: Size.dividerThick, marginLeft: Spacing.lg, backgroundColor: colors.border }} />
            <ProfileField label="Email" value={user.email || ""} onPress={() => { haptics.selection(); setEditingField("email"); }} colors={colors} />
          </MaterialCard>
        </View>

        <View style={sectionStyle}>
          <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>
            Security
          </ThemedText>
          <MaterialCard style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: Spacing.lg,
                minHeight: 44,
                borderRadius: Radius.lg,
                borderCurve: "continuous",
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => { haptics.selection(); setShowChangePassword(true); }}
              accessibilityRole="button"
              accessibilityLabel="Change password"
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
                <IconSymbol name="lock.fill" size={IconSize["2xl"]} color={colors.mutedForeground} />
                <ThemedText style={{ fontSize: FontSize.xl }}>Change Password</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
            </Pressable>
          </MaterialCard>
        </View>

        <SubscriptionSection
          isPremium={isPremium}
          dreamLimit={dreamLimit}
          dreamCount={dreamCount}
          isTrialActive={isTrialActive}
          trialDaysRemaining={trialDaysRemaining}
          hasTrialExpired={hasTrialExpired}
          showUpgrade={showUpgrade}
          showCustomerCenter={showCustomerCenter}
          restorePurchases={restorePurchases}
          colors={colors}
        />

        <SettingsSection title="Appearance" colors={colors}>
          <ThemePicker mode={mode} onModeChange={setMode} colors={colors} />
        </SettingsSection>

        <SettingsSection title="Preferences" colors={colors}>
          <SettingsLinkItem href="/dashboard/notifications" icon="bell.fill" label="Notifications" colors={colors} />
          <View style={[settingsDividerStyle, { backgroundColor: colors.border }]} />
          <SettingsLinkItem href="/dashboard/privacy" icon="hand.raised.fill" label="Privacy" colors={colors} />
        </SettingsSection>

        <SettingsSection title="Support" colors={colors}>
          <SettingsLinkItem href="/dashboard/help" icon="questionmark.circle.fill" label="Help" colors={colors} />
          <View style={[settingsDividerStyle, { backgroundColor: colors.border }]} />
          <SettingsLinkItem href="/dashboard/about" icon="info.circle.fill" label="About" colors={colors} />
        </SettingsSection>

        <SettingsSection title="Account" colors={colors}>
          <SettingsItem icon="rectangle.portrait.and.arrow.right" label="Sign Out" onPress={handleSignOut} showChevron={false} colors={colors} />
        </SettingsSection>

        {__DEV__ && (
          <SettingsSection title="Developer" colors={colors}>
            <SettingsItem icon="arrow.clockwise" label="Reset Onboarding" onPress={handleResetOnboarding} showChevron={false} colors={colors} />
          </SettingsSection>
        )}

        <SettingsSection title="Danger Zone" colors={colors}>
          {isDeleting ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.lg, gap: Spacing.md }}>
              <ActivityIndicator color={colors.destructive} />
              <ThemedText style={{ fontSize: FontSize.xl, fontWeight: "500" }} color={colors.destructive}>
                Deleting account...
              </ThemedText>
            </View>
          ) : (
            <SettingsItem icon="trash.fill" label="Delete Account" onPress={handleDeleteAccount} destructive showChevron={false} colors={colors} />
          )}
        </SettingsSection>

        {editingField && (() => {
          const configs = {
            name: { title: "Edit Name", label: "Name", value: user.name || "", placeholder: "Enter your name", autoCapitalize: "words" as const },
            username: { title: "Edit Username", label: "Username", value: user.username || "", placeholder: "3-20 characters", autoCapitalize: "none" as const },
            email: { title: "Edit Email", label: "Email", value: user.email || "", placeholder: "Enter your email", autoCapitalize: "none" as const, keyboardType: "email-address" as const },
          };
          const config = configs[editingField];
          return (
            <EditModal
              visible
              onClose={() => setEditingField(null)}
              title={config.title}
              label={config.label}
              value={config.value}
              onSave={(value) => handleUpdateAccountField(editingField, value)}
              colors={colors}
              placeholder={config.placeholder}
              autoCapitalize={config.autoCapitalize}
              keyboardType={"keyboardType" in config ? config.keyboardType : undefined}
            />
          );
        })()}

        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}
