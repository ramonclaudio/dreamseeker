import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authStyles as styles, getErrorStyles } from '@/constants/auth-styles';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

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
          <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>
            Check your email
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: 'center' }]}>
            We sent a verification link to{'\n'}
            <Text style={{ fontWeight: '600', color: colors.foreground }}>{email}</Text>
          </Text>
          <Text style={[styles.hint, { color: colors.mutedForeground, textAlign: 'center' }]}>
            Click the link in your email to verify your account, then sign in.
          </Text>
        </View>

        <View style={{ gap: 12, marginTop: 32 }}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/sign-in')}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Go to Sign In
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleResendEmail}
            disabled={isLoading}>
            <Text style={[styles.buttonText, { color: colors.foreground }]}>
              {isLoading ? 'Sending...' : 'Resend Email'}
            </Text>
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
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign up to get started
          </Text>
        </View>

        {error && (
          <View style={getErrorStyles(colorScheme).container}>
            <Text style={getErrorStyles(colorScheme).text}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>Name</Text>
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
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>Username</Text>
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
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
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
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
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
            disabled={isLoading}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={[styles.linkText, { color: colors.foreground }]}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
