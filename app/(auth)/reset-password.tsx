import { useState, useEffect } from 'react';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authStyles as styles } from '@/constants/auth-styles';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [token]);

  const clearError = () => setError(null);

  const handleResetPassword = async () => {
    setError(null);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
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
        const message = response.error.message ?? 'Failed to reset password';
        if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
          setError('This reset link has expired. Please request a new one.');
        } else {
          setError(message);
        }
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <Text style={[styles.title, { color: colors.text }]}>Password reset!</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Your password has been successfully reset. You can now sign in with your
            new password.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.replace('/sign-in')}>
            <Text style={styles.buttonText}>Sign In</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Enter your new password below
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="Enter new password"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.icon}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 },
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
