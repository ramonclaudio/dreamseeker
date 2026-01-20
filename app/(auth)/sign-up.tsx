import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { useColorScheme, useColors } from '@/hooks/use-color-scheme';
import { authStyles as styles, getErrorStyles } from '@/constants/auth-styles';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const handleSignUp = async () => {
    haptics.light();
    setError(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      haptics.error();
      setError('Please fill in all fields');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      haptics.error();
      setError('Username must be 3-20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      haptics.error();
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (password.length < 10) {
      haptics.error();
      setError('Password must be at least 10 characters');
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
        setError('Unable to create account. Please try a different email or username.');
      } else {
        haptics.success();
        setShowVerification(true);
      }
    } catch {
      haptics.error();
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    haptics.light();
    setIsLoading(true);
    try {
      await authClient.sendVerificationEmail({ email: email.trim() });
      haptics.success();
    } catch {
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <View style={[styles.container, styles.successContent, { backgroundColor: colors.background }]}>
        <View style={{ alignItems: 'center', gap: 16 }}>
          <IconSymbol name="envelope.badge" size={64} color={colors.primary} />
          <ThemedText style={[styles.title, { textAlign: 'center' }]}>
            Check your email
          </ThemedText>
          <ThemedText style={[styles.subtitle, { textAlign: 'center' }]} color={colors.mutedForeground}>
            We sent a verification link to{'\n'}
            <ThemedText style={{ fontWeight: '600' }}>{email}</ThemedText>
          </ThemedText>
          <ThemedText style={[styles.hint, { textAlign: 'center' }]} color={colors.mutedForeground}>
            Click the link in your email to verify your account, then sign in.
          </ThemedText>
        </View>

        <View style={{ gap: 12, marginTop: 32 }}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in">
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              Go to Sign In
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleResendEmail}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? 'Sending email' : 'Resend verification email'}
            accessibilityState={{ disabled: isLoading }}>
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Resend Email'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <ThemedText style={styles.title}>Create account</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Sign up to get started
          </ThemedText>
        </View>

        {error && (
          <View style={getErrorStyles(colorScheme).container}>
            <ThemedText style={getErrorStyles(colorScheme).text}>{error}</ThemedText>
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
            accessibilityLabel={isLoading ? 'Creating account' : 'Sign up'}
            accessibilityState={{ disabled: isLoading }}>
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} color={colors.mutedForeground}>
            Already have an account?{' '}
          </ThemedText>
          <Link href="/sign-in" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Sign in" accessibilityHint="Go to sign in screen">
              <ThemedText style={styles.linkText}>Sign In</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
