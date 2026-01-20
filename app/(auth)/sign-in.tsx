import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';

import { authClient, signInWithUsername } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { useColors } from '@/hooks/use-color-scheme';
import { authStyles as styles, getErrorStyles } from '@/constants/auth-styles';
import { AppleSignInButton } from '@/components/ui/apple-sign-in-button';
import { ThemedText } from '@/components/ui/themed-text';

export default function SignInScreen() {
  const colors = useColors();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    haptics.light();
    setError(null);

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      haptics.error();
      setError('Please enter email/username and password');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = trimmed.includes('@');
      const response = isEmail
        ? await authClient.signIn.email({ email: trimmed, password })
        : await signInWithUsername({ username: trimmed.toLowerCase(), password });

      if (response.error) {
        haptics.error();
        setError('Invalid email/username or password');
      } else {
        haptics.success();
      }
    } catch {
      haptics.error();
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <ThemedText style={styles.title}>Welcome back</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Sign in to your account
          </ThemedText>
        </View>

        {error && (
          <View style={getErrorStyles(colors).container}>
            <ThemedText style={getErrorStyles(colors).text}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email or Username</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
              placeholder="you@example.com or username"
              placeholderTextColor={colors.mutedForeground}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              accessibilityLabel="Email or username"
              accessibilityHint="Enter your email address or username"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <Link href="/forgot-password" asChild>
                <Pressable>
                  <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                </Pressable>
              </Link>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password"
              accessibilityLabel="Password"
              accessibilityHint="Enter your password"
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
            onPress={handleSignIn}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? 'Signing in' : 'Sign in'}
            accessibilityState={{ disabled: isLoading }}>
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </ThemedText>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <ThemedText style={styles.dividerText} color={colors.mutedForeground}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <AppleSignInButton onError={(err) => setError(err)} />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} color={colors.mutedForeground}>
            Don&apos;t have an account?{' '}
          </ThemedText>
          <Link href="/sign-up" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Sign up" accessibilityHint="Go to create account screen">
              <ThemedText style={styles.linkText}>Sign Up</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
