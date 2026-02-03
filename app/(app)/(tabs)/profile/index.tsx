import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import * as Clipboard from "expo-clipboard";

import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius, type ColorPalette } from "@/constants/theme";
import {
  MaxWidth,
  Breakpoint,
  Spacing,
  TouchTarget,
  FontSize,
  HitSlop,
  IconSize,
  LineHeight,
} from "@/constants/layout";
import { Opacity, Size, Duration, Responsive, Shadow } from "@/constants/ui";
import { useColorScheme, useColors, useThemeMode, type ThemeMode } from "@/hooks/use-color-scheme";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { authClient } from "@/lib/auth-client";
import { haptics } from "@/lib/haptics";
import { api } from "@/convex/_generated/api";

const sectionStyle = { marginTop: Spacing["2xl"], paddingHorizontal: Spacing.xl, gap: Spacing.sm };

// Responsive avatar: scales up on larger screens
function useAvatarSize() {
  const { width } = useWindowDimensions();
  if (width >= Breakpoint.desktop) return Responsive.avatar.desktop;
  if (width >= Breakpoint.tablet) return Responsive.avatar.tablet;
  return Responsive.avatar.phone;
}
const fieldDividerStyle = { height: Size.dividerThick, marginLeft: Spacing.lg };
const inputGroupStyle = { gap: Spacing.sm };
const inputStyle = {
  borderRadius: Radius.md,
  borderCurve: "continuous" as const,
  padding: Spacing.lg,
  fontSize: FontSize.xl,
};
const buttonStyle = {
  borderRadius: Radius.md,
  borderCurve: "continuous" as const,
  padding: Spacing.lg,
  minHeight: TouchTarget.min,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  marginTop: Spacing.sm,
};
const errorContainerStyle = {
  borderWidth: 1,
  borderRadius: Radius.md,
  borderCurve: "continuous" as const,
  padding: Spacing.md,
};
const modalHeaderBaseStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  paddingHorizontal: Spacing.xl,
  paddingBottom: Spacing.lg,
  borderBottomWidth: 0.5,
};

function ProfileField({
  label,
  value,
  onPress,
  colors,
}: {
  label: string;
  value: string;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: Spacing.lg,
          minHeight: TouchTarget.min,
        },
        { opacity: pressed ? Opacity.pressed : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      accessibilityValue={{ text: value || "Not set" }}
      accessibilityHint={`Double tap to edit your ${label.toLowerCase()}`}
    >
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <ThemedText
          style={{ fontSize: FontSize.sm, fontWeight: "500", textTransform: "uppercase" }}
          color={colors.mutedForeground}
        >
          {label}
        </ThemedText>
        <ThemedText
          selectable
          style={{ fontSize: FontSize.xl }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || "Not set"}
        </ThemedText>
      </View>
      <IconSymbol name="pencil" size={IconSize.lg} color={colors.mutedForeground} />
    </Pressable>
  );
}

function EditModal({
  visible,
  onClose,
  title,
  label,
  value: initialValue,
  onSave,
  colors,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  colors: ColorPalette;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setValue(initialValue);
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!value.trim()) {
      setError(`${label} cannot be empty`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSave(value.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={[
            modalHeaderBaseStyle,
            { paddingTop: Spacing.lg, borderBottomColor: colors.separator },
          ]}
        >
          <Pressable
            onPress={handleClose}
            hitSlop={HitSlop.sm}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            {title}
          </ThemedText>
          <Pressable
            onPress={handleSave}
            hitSlop={HitSlop.sm}
            disabled={isLoading}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Saving" : "Save"}
            accessibilityState={{ disabled: isLoading }}
          >
            <ThemedText style={{ fontWeight: "600", opacity: isLoading ? 0.5 : 1 }}>
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ flex: 1, padding: Spacing.xl, gap: Spacing.xl }}>
          {error && (
            <View
              style={[
                errorContainerStyle,
                { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive },
              ]}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.destructive}
              >
                {error}
              </ThemedText>
            </View>
          )}

          <View style={inputGroupStyle}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>{label}</ThemedText>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError(null);
              }}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoFocus
              accessibilityLabel={label}
              accessibilityHint={`Enter your ${label.toLowerCase()}`}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChangePasswordModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearError = () => setError(null);

  const handleChangePassword = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 10) {
      setError("New password must be at least 10 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (authError) {
        const message = authError.message ?? "Failed to change password";
        if (
          message.toLowerCase().includes("incorrect") ||
          message.toLowerCase().includes("wrong")
        ) {
          setError("Current password is incorrect");
        } else {
          setError(message);
        }
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={[
            modalHeaderBaseStyle,
            {
              paddingTop: Spacing.lg,
              borderBottomColor: colors.separator,
              position: "relative",
              justifyContent: "center",
            },
          ]}
        >
          <Pressable
            onPress={handleClose}
            hitSlop={HitSlop.sm}
            accessibilityRole="button"
            accessibilityLabel={success ? "Done" : "Cancel"}
            style={{
              position: "absolute",
              left: Spacing.xl,
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{ fontWeight: success ? "600" : "400" }}
              color={success ? colors.foreground : colors.mutedForeground}
            >
              {success ? "Done" : "Cancel"}
            </ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            Change Password
          </ThemedText>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: Spacing.xl,
            paddingBottom: Spacing["4xl"],
            gap: Spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View
              style={[
                errorContainerStyle,
                { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive },
              ]}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.destructive}
              >
                {error}
              </ThemedText>
            </View>
          )}

          {success && (
            <View
              style={[
                errorContainerStyle,
                { backgroundColor: `${colors.success}15`, borderColor: colors.success },
              ]}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.success}
              >
                Password changed successfully!
              </ThemedText>
            </View>
          )}

          <View style={inputGroupStyle}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Current Password
            </ThemedText>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter current password"
              placeholderTextColor={colors.mutedForeground}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="current-password"
              accessibilityLabel="Current password"
              accessibilityHint="Enter your current password"
            />
          </View>

          <View style={inputGroupStyle}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              New Password
            </ThemedText>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter new password"
              placeholderTextColor={colors.mutedForeground}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
              accessibilityLabel="New password"
              accessibilityHint="Enter a new password with at least 10 characters"
            />
          </View>

          <View style={inputGroupStyle}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Confirm New Password
            </ThemedText>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
              accessibilityLabel="Confirm new password"
              accessibilityHint="Re-enter your new password to confirm"
            />
          </View>

          <Pressable
            style={[
              buttonStyle,
              { backgroundColor: colors.primary, opacity: isLoading || success ? 0.7 : 1 },
            ]}
            onPress={handleChangePassword}
            disabled={isLoading || success}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Changing password" : "Change password"}
            accessibilityState={{ disabled: isLoading || success }}
          >
            <ThemedText
              style={{ fontSize: FontSize.base, fontWeight: "500" }}
              color={colors.primaryForeground}
            >
              {isLoading ? "Changing..." : "Change Password"}
            </ThemedText>
          </Pressable>

          <ThemedText
            style={{
              fontSize: FontSize.md,
              textAlign: "center",
              marginTop: Spacing.lg,
              lineHeight: LineHeight.tight,
            }}
            color={colors.mutedForeground}
          >
            For security, you will remain signed in on this device. All other sessions will be
            signed out.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const settingsItemStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  padding: Spacing.lg,
  minHeight: TouchTarget.min,
};
const settingsItemLeftStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: Spacing.md,
};
const settingsDividerStyle = { height: Size.divider, marginLeft: Size.dividerMargin };
const settingsSectionTitleStyle = {
  fontSize: FontSize.md,
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  marginLeft: Spacing.md,
};
const settingsSectionContentStyle = {
  borderRadius: Radius.lg,
  borderCurve: "continuous" as const,
  overflow: "hidden" as const,
};

function SettingsItem({
  icon,
  label,
  onPress,
  destructive,
  showChevron = true,
  colors,
}: {
  icon: Parameters<typeof IconSymbol>[0]["name"];
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
      accessibilityLabel={label}
    >
      <View style={settingsItemLeftStyle}>
        <IconSymbol
          name={icon}
          size={IconSize["2xl"]}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
        <ThemedText
          style={{ fontSize: FontSize.xl }}
          color={destructive ? colors.destructive : colors.text}
        >
          {label}
        </ThemedText>
      </View>
      {showChevron && (
        <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function SettingsLinkItem({
  href,
  icon,
  label,
  colors,
}: {
  href: "/profile/notifications" | "/profile/privacy" | "/profile/help" | "/profile/about";
  icon: Parameters<typeof IconSymbol>[0]["name"];
  label: string;
  colors: ColorPalette;
}) {
  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(href);
    haptics.light();
  };

  if (process.env.EXPO_OS !== "ios") {
    return (
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [settingsItemStyle, { opacity: pressed ? Opacity.pressed : 1 }]}
          accessibilityRole="link"
          accessibilityLabel={label}
        >
          <View style={settingsItemLeftStyle}>
            <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
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
          <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
        </View>
      </Link.Trigger>
      <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction title="Copy Link" icon="doc.on.doc" onPress={handleCopyLink} />
      </Link.Menu>
    </Link>
  );
}

function SettingsSection({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: ColorPalette;
}) {
  return (
    <View style={sectionStyle}>
      {title && (
        <ThemedText style={settingsSectionTitleStyle} color={colors.mutedForeground}>
          {title}
        </ThemedText>
      )}
      <MaterialCard style={settingsSectionContentStyle}>{children}</MaterialCard>
    </View>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function ThemePicker({
  mode,
  onModeChange,
  colors,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  colors: ColorPalette;
}) {
  const colorScheme = useColorScheme();
  const icon = colorScheme === "dark" ? "moon.fill" : "sun.max.fill";
  return (
    <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
        <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
        <ThemedText style={{ fontSize: FontSize.xl }}>Theme</ThemedText>
      </View>
      <View
        style={{
          flexDirection: "row",
          borderRadius: Radius.md,
          borderCurve: "continuous",
          padding: Spacing.xxs,
          backgroundColor: colors.muted,
        }}
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                {
                  flex: 1,
                  paddingVertical: Spacing.md,
                  minHeight: TouchTarget.min,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: Radius.sm,
                  borderCurve: "continuous",
                },
                isSelected && {
                  boxShadow: `${Shadow.sm} ${colors.shadow}`,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => {
                haptics.light();
                onModeChange(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityState={{ selected: isSelected }}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "500" }}
                color={isSelected ? colors.foreground : colors.mutedForeground}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { mode, setMode } = useThemeMode();
  const user = useQuery(api.auth.getCurrentUser);
  const deleteAccountMutation = useMutation(api.users.deleteAccount);
  const {
    isUploading: isUploadingAvatar,
    showOptions: showAvatarOptions,
    avatarInitial,
  } = useAvatarUpload(user);
  const avatarSize = useAvatarSize();

  const [showEditName, setShowEditName] = useState(false);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async (name: string) => {
    const { error } = await authClient.updateUser({ name });
    if (error) {
      haptics.error();
      throw new Error(error.message ?? "Failed to update name");
    }
    haptics.success();
  };

  const handleUpdateUsername = async (username: string) => {
    if (username.length < 3) {
      haptics.error();
      throw new Error("Username must be at least 3 characters");
    }
    if (username.length > 20) {
      haptics.error();
      throw new Error("Username must be at most 20 characters");
    }
    const { error } = await authClient.updateUser({ username });
    if (error) {
      haptics.error();
      const message = error.message ?? "";
      if (message.toLowerCase().includes("already taken")) {
        throw new Error("Username is already taken");
      }
      throw new Error(message || "Failed to update username");
    }
    haptics.success();
  };

  const handleUpdateEmail = async (newEmail: string) => {
    const { error } = await authClient.changeEmail({ newEmail });
    if (error) {
      haptics.error();
      throw new Error(error.message ?? "Failed to update email");
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
      if (process.env.EXPO_OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Deletion Failed", message);
      }
    }
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    haptics.warning();
    const message =
      "Are you sure you want to delete your account? This will permanently delete all your data including tasks, sessions, and profile information. This action cannot be undone.";

    if (process.env.EXPO_OS === "web") {
      if (window.confirm(message)) {
        performDeleteAccount();
      }
    } else {
      Alert.alert("Delete Account", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDeleteAccount,
        },
      ]);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: Spacing["4xl"],
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {user && (
          <>
            <View style={{ alignItems: "center", paddingVertical: Spacing.xl, gap: Spacing.sm }}>
              <Pressable
                onPress={showAvatarOptions}
                disabled={isUploadingAvatar}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  minHeight: TouchTarget.min,
                })}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                accessibilityHint="Double tap to choose a new profile photo"
                accessibilityState={{ disabled: isUploadingAvatar }}
              >
                <View style={{ position: "relative" }}>
                  {user.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                      contentFit="cover"
                      transition={Duration.normal}
                    />
                  ) : (
                    <View
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        backgroundColor: colors.primary,
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: avatarSize * 0.36,
                          lineHeight: avatarSize * 0.36,
                          fontWeight: "600",
                          textAlign: "center",
                          includeFontPadding: false,
                        }}
                        color={colors.primaryForeground}
                      >
                        {avatarInitial}
                      </ThemedText>
                    </View>
                  )}
                  {isUploadingAvatar ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: avatarSize / 2,
                        backgroundColor: colors.overlay,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color={colors.primaryForeground} size="large" />
                    </View>
                  ) : (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: Size.badge,
                        height: Size.badge,
                        borderRadius: Size.badge / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 3,
                        backgroundColor: colors.primary,
                        borderColor: colors.background,
                      }}
                    >
                      <IconSymbol
                        name="camera.fill"
                        size={IconSize.sm}
                        color={colors.primaryForeground}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
              <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
                Tap to change photo
              </ThemedText>
            </View>

            <View style={sectionStyle}>
              <ThemedText
                style={{
                  fontSize: FontSize.md,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginLeft: Spacing.md,
                }}
                color={colors.mutedForeground}
              >
                Account Info
              </ThemedText>
              <MaterialCard
                style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}
              >
                <ProfileField
                  label="Name"
                  value={user.name || ""}
                  onPress={() => {
                    haptics.selection();
                    setShowEditName(true);
                  }}
                  colors={colors}
                />
                <View style={[fieldDividerStyle, { backgroundColor: colors.border }]} />
                <ProfileField
                  label="Username"
                  value={user.username ? `@${user.username}` : ""}
                  onPress={() => {
                    haptics.selection();
                    setShowEditUsername(true);
                  }}
                  colors={colors}
                />
                <View style={[fieldDividerStyle, { backgroundColor: colors.border }]} />
                <ProfileField
                  label="Email"
                  value={user.email || ""}
                  onPress={() => {
                    haptics.selection();
                    setShowEditEmail(true);
                  }}
                  colors={colors}
                />
              </MaterialCard>
            </View>

            <View style={sectionStyle}>
              <ThemedText
                style={{
                  fontSize: FontSize.md,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginLeft: Spacing.md,
                }}
                color={colors.mutedForeground}
              >
                Security
              </ThemedText>
              <MaterialCard
                style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}
              >
                <Pressable
                  style={({ pressed }) => [
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: Spacing.lg,
                      minHeight: TouchTarget.min,
                      borderRadius: Radius.lg,
                      borderCurve: "continuous",
                    },
                    { opacity: pressed ? Opacity.pressed : 1 },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setShowChangePassword(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Change password"
                  accessibilityHint="Double tap to open change password form"
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
                    <IconSymbol
                      name="lock.fill"
                      size={IconSize["2xl"]}
                      color={colors.mutedForeground}
                    />
                    <ThemedText style={{ fontSize: FontSize.xl }}>Change Password</ThemedText>
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={IconSize.md}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </MaterialCard>
            </View>

            <SettingsSection title="Appearance" colors={colors}>
              <ThemePicker mode={mode} onModeChange={setMode} colors={colors} />
            </SettingsSection>

            <SettingsSection title="Preferences" colors={colors}>
              <SettingsLinkItem
                href="/profile/notifications"
                icon="bell.fill"
                label="Notifications"
                colors={colors}
              />
              <View style={[settingsDividerStyle, { backgroundColor: colors.border }]} />
              <SettingsLinkItem
                href="/profile/privacy"
                icon="hand.raised.fill"
                label="Privacy"
                colors={colors}
              />
            </SettingsSection>

            <SettingsSection title="Support" colors={colors}>
              <SettingsLinkItem
                href="/profile/help"
                icon="questionmark.circle.fill"
                label="Help"
                colors={colors}
              />
              <View style={[settingsDividerStyle, { backgroundColor: colors.border }]} />
              <SettingsLinkItem
                href="/profile/about"
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: Spacing.lg,
                    gap: Spacing.md,
                  }}
                >
                  <ActivityIndicator color={colors.destructive} />
                  <ThemedText
                    style={{ fontSize: FontSize.xl, fontWeight: "500" }}
                    color={colors.destructive}
                  >
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

            <EditModal
              visible={showEditName}
              onClose={() => setShowEditName(false)}
              title="Edit Name"
              label="Name"
              value={user.name || ""}
              onSave={handleUpdateName}
              colors={colors}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            <EditModal
              visible={showEditUsername}
              onClose={() => setShowEditUsername(false)}
              title="Edit Username"
              label="Username"
              value={user.username || ""}
              onSave={handleUpdateUsername}
              colors={colors}
              placeholder="Enter your username (3-20 characters)"
              autoCapitalize="none"
            />

            <EditModal
              visible={showEditEmail}
              onClose={() => setShowEditEmail(false)}
              title="Edit Email"
              label="Email"
              value={user.email || ""}
              onSave={handleUpdateEmail}
              colors={colors}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ChangePasswordModal
              visible={showChangePassword}
              onClose={() => setShowChangePassword(false)}
              colors={colors}
            />
          </>
        )}
      </ScrollView>
    </>
  );
}
