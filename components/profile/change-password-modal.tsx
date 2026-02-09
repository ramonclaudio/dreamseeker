import { useState } from "react";
import {
  View,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, TouchTarget, FontSize, HitSlop, LineHeight } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import type { ColorPalette } from "@/constants/theme";

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

export function ChangePasswordModal({
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
