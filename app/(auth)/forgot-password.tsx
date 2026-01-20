import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { env } from '@/lib/env';
import { useColors } from '@/hooks/use-color-scheme';
import { authStyles as styles, getErrorStyles } from '@/constants/auth-styles';
import { ThemedText } from '@/components/ui/themed-text';

export default function ForgotPasswordScreen() {
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    haptics.light();
    setError(null);

    if (!email.trim()) {
      haptics.error();
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${env.siteUrl}/reset-password`,
      });

      if (response.error) {
        haptics.error();
        setError(response.error.message ?? 'Failed to send reset email');
      } else {
        haptics.success();
        setIsSubmitted(true);
      }
    } catch {
      haptics.error();
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <ThemedText style={styles.title}>Check your email</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            We&apos;ve sent a password reset link to {email}
          </ThemedText>
          <ThemedText style={styles.hint} color={colors.mutedForeground}>
            If you don&apos;t see it, check your spam folder.
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in">
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              Back to Sign In
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <ThemedText style={styles.title}>Forgot password?</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Enter your email and we&apos;ll send you a reset link
          </ThemedText>
        </View>

        {error && (
          <View style={getErrorStyles(colors).container}>
            <ThemedText style={getErrorStyles(colors).text}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
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
              accessibilityHint="Enter your email address to receive a reset link"
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
            onPress={handleForgotPassword}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? 'Sending reset link' : 'Send reset link'}
            accessibilityState={{ disabled: isLoading }}>
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} color={colors.mutedForeground}>
            Remember your password?{' '}
          </ThemedText>
          <Link href="/sign-in" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Sign in" accessibilityHint="Go back to sign in screen">
              <ThemedText style={styles.linkText}>Sign In</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
