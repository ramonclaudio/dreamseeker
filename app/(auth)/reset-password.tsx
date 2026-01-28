import { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { authClient } from "@/lib/auth-client";
import { haptics } from "@/lib/haptics";
import { useColors } from "@/hooks/use-color-scheme";
import { authStyles as styles, getErrorStyles } from "@/constants/auth-styles";
import { ThemedText } from "@/components/ui/themed-text";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    haptics.light();
    setError(null);

    if (!password || !confirmPassword) {
      haptics.error();
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      haptics.error();
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      haptics.error();
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      haptics.error();
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (response.error) {
        haptics.error();
        const message = response.error.message ?? "Failed to reset password";
        if (
          message.toLowerCase().includes("expired") ||
          message.toLowerCase().includes("invalid")
        ) {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setError(message);
        }
      } else {
        haptics.success();
        setIsSuccess(true);
      }
    } catch {
      haptics.error();
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <ThemedText variant="title">Password reset!</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Your password has been successfully reset. You can now sign in with your new password.
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/sign-in")}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              Sign In
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <ThemedText variant="title">Reset password</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Enter your new password below
          </ThemedText>
        </View>

        {error && (
          <View style={getErrorStyles(colors).container}>
            <ThemedText selectable style={getErrorStyles(colors).text}>
              {error}
            </ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>New Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password-new"
              accessibilityLabel="New password"
              accessibilityHint="Create a new password with at least 8 characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password-new"
              accessibilityLabel="Confirm password"
              accessibilityHint="Re-enter your new password to confirm"
            />
          </View>

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Resetting password" : "Reset password"}
            accessibilityState={{ disabled: isLoading }}
          >
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
