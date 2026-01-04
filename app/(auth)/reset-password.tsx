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
import { router, useLocalSearchParams } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authStyles as styles, getErrorStyles } from '@/constants/auth-styles';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    haptics.light();
    setError(null);

    if (!password || !confirmPassword) {
      haptics.error();
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      haptics.error();
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      haptics.error();
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      haptics.error();
      setError('Invalid reset link. Please request a new one.');
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
        const message = response.error.message ?? 'Failed to reset password';
        if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
          setError('This reset link has expired. Please request a new one.');
        } else {
          setError(message);
        }
      } else {
        haptics.success();
        setIsSuccess(true);
      }
    } catch {
      haptics.error();
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>Password reset!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/sign-in')}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Sign In</Text>
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
          <Text style={[styles.title, { color: colors.foreground }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter your new password below
          </Text>
        </View>

        {error && (
          <View style={getErrorStyles(colorScheme).container}>
            <Text style={getErrorStyles(colorScheme).text}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>New Password</Text>
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
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
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
            disabled={isLoading}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
