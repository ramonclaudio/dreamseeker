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
import { Link } from 'expo-router';

import { authClient, signInWithUsername } from '@/lib/auth-client';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authStyles as styles } from '@/constants/auth-styles';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setError('Please enter email/username and password');
      return;
    }

    setIsLoading(true);
    try {
      // Detect email vs username by checking for @
      const isEmail = trimmed.includes('@');
      const response = isEmail
        ? await authClient.signIn.email({ email: trimmed, password })
        : await signInWithUsername({ username: trimmed.toLowerCase(), password });

      if (response.error) {
        setError(response.error.message ?? 'Invalid credentials');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Sign in to your account
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email or Username</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
                error && styles.inputError,
              ]}
              placeholder="you@example.com or username"
              placeholderTextColor={colors.icon}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <Link href="/forgot-password" asChild>
                <Pressable>
                  <Text style={[styles.forgotText, { color: colors.tint }]}>
                    Forgot password?
                  </Text>
                </Pressable>
              </Link>
            </View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
                error && styles.inputError,
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 },
            ]}
            onPress={handleSignIn}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.icon }]}>
            Don&apos;t have an account?{' '}
          </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={[styles.linkText, { color: colors.tint }]}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
