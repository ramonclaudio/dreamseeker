import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";

import { authClient } from "@/lib/auth-client";
import { haptics } from "@/lib/haptics";
import { useColors } from "@/hooks/use-color-scheme";
import { authStyles as styles, getErrorStyles } from "@/constants/auth-styles";
import { Spacing, IconSize } from "@/constants/layout";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";

type OtpVerificationProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
};

export function OtpVerification({ email, onBack, onSuccess }: OtpVerificationProps) {
  const colors = useColors();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        onSuccess();
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

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} color={colors.mutedForeground}>
            Wrong email?{" "}
          </ThemedText>
          <Pressable
            style={styles.linkTouchTarget}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Return to sign up form to correct your email"
          >
            <ThemedText style={styles.linkText}>Go back</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
