import { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, ScrollView } from "react-native";
import { Link, router } from "expo-router";

import { authClient } from "@/lib/auth-client";
import { haptics } from "@/lib/haptics";
import { useColors } from "@/hooks/use-color-scheme";
import { authStyles as styles, getErrorStyles } from "@/constants/auth-styles";
import { Spacing, IconSize } from "@/constants/layout";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";

export default function SignUpScreen() {
  const colors = useColors();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSignUp = async () => {
    haptics.light();
    setError(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      haptics.error();
      setError("Please fill in all fields");
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      haptics.error();
      setError("Username must be 3-20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      haptics.error();
      setError("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    if (password.length < 10) {
      haptics.error();
      setError("Password must be at least 10 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        username: trimmedUsername,
      });

      if (response.error) {
        haptics.error();
        setError("Unable to create account. Please try a different email or username.");
      } else {
        haptics.success();
        setShowVerification(true);
      }
    } catch {
      haptics.error();
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    haptics.light();
    setOtpError(null);

    if (otp.length !== 6) {
      haptics.error();
      setOtpError("Please enter the 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp,
      });

      if (response.error) {
        haptics.error();
        setOtpError("Invalid or expired code. Please try again.");
      } else {
        haptics.success();
        router.replace("/sign-in");
      }
    } catch {
      haptics.error();
      setOtpError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    haptics.light();
    setIsLoading(true);
    setOtpError(null);
    try {
      await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "email-verification" });
      haptics.success();
    } catch {
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <View
        style={[styles.container, styles.successContent, { backgroundColor: colors.background }]}
      >
        <View style={{ alignItems: "center", gap: Spacing.lg }}>
          <IconSymbol name="envelope.badge" size={IconSize["6xl"]} color={colors.primary} />
          <ThemedText variant="title" style={{ textAlign: "center" }}>
            Verify your email
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { textAlign: "center" }]}
            color={colors.mutedForeground}
          >
            Enter the 6-digit code sent to{"\n"}
            <ThemedText style={{ fontWeight: "600" }}>{email}</ThemedText>
          </ThemedText>
        </View>

        {otpError && (
          <View style={getErrorStyles(colors).container}>
            <ThemedText selectable style={getErrorStyles(colors).text}>
              {otpError}
            </ThemedText>
          </View>
        )}

        <View style={{ gap: Spacing.md, marginTop: Spacing["3xl"] }}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondary,
                color: colors.foreground,
                borderColor: colors.border,
                textAlign: "center",
                fontSize: 24,
                letterSpacing: 8,
                fontVariant: ["tabular-nums"],
              },
            ]}
            placeholder="000000"
            placeholderTextColor={colors.mutedForeground}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/\D/g, "").slice(0, 6));
              setOtpError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            accessibilityLabel="Verification code"
            accessibilityHint="Enter the 6-digit code from your email"
          />

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: isVerifying || otp.length !== 6 ? 0.7 : 1,
              },
            ]}
            onPress={handleVerifyOtp}
            disabled={isVerifying || otp.length !== 6}
            accessibilityRole="button"
            accessibilityLabel={isVerifying ? "Verifying code" : "Verify code"}
            accessibilityState={{ disabled: isVerifying || otp.length !== 6 }}
          >
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isVerifying ? "Verifying..." : "Verify"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleResendCode}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Sending code" : "Resend verification code"}
            accessibilityState={{ disabled: isLoading }}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Sending..." : "Resend Code"}
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
          <ThemedText variant="title">Create account</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Sign up to get started
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
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              autoComplete="name"
              accessibilityLabel="Name"
              accessibilityHint="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="3-20 characters"
              placeholderTextColor={colors.mutedForeground}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoComplete="username-new"
              autoCorrect={false}
              accessibilityLabel="Username"
              accessibilityHint="Choose a username between 3 and 20 characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email"
              accessibilityHint="Enter your email address"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="At least 10 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password-new"
              accessibilityLabel="Password"
              accessibilityHint="Create a password with at least 10 characters"
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
            onPress={handleSignUp}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Creating account" : "Sign up"}
            accessibilityState={{ disabled: isLoading }}
          >
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} color={colors.mutedForeground}>
            Already have an account?{" "}
          </ThemedText>
          <Link href="/sign-in" asChild>
            <Pressable
              style={styles.linkTouchTarget}
              accessibilityRole="link"
              accessibilityLabel="Sign in"
              accessibilityHint="Go to sign in screen"
            >
              <ThemedText style={styles.linkText}>Sign In</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
