import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authStyles as styles } from '@/constants/auth-styles';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (response.error) {
        setError(response.error.message ?? 'Failed to send reset email');
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            We&apos;ve sent a password reset link to {email}
          </Text>
          <Text style={[styles.hint, { color: colors.icon }]}>
            If you don&apos;t see it, check your spam folder.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.replace('/sign-in')}>
            <Text style={styles.buttonText}>Back to Sign In</Text>
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
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Forgot password?</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Enter your email and we&apos;ll send you a reset link
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 },
            ]}
            onPress={handleForgotPassword}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.icon }]}>
            Remember your password?{' '}
          </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={[styles.linkText, { color: colors.tint }]}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
