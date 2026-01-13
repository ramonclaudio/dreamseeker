import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authClient } from '@/lib/auth-client';

export function useAppleAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAvailable);
    }
  }, []);

  const signInWithApple = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAvailable) {
      return { success: false, error: 'Apple Sign-In is not available' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError('No identity token received');
        return { success: false, error: 'No identity token received' };
      }

      const response = await authClient.signIn.social({
        provider: 'apple',
        idToken: {
          token: credential.identityToken,
        },
      });

      if (response.error) {
        setError(response.error.message ?? 'Apple Sign-In failed');
        return { success: false, error: response.error.message };
      }

      return { success: true };
    } catch (err) {
      if ((err as any).code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Cancelled' };
      }
      const message = err instanceof Error ? err.message : 'Apple Sign-In failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAvailable,
    isLoading,
    error,
    signInWithApple,
  };
}
