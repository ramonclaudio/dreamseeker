import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleAuth } from '@/hooks/use-apple-auth';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function AppleSignInButton({ onSuccess, onError }: Props) {
  const colorScheme = useColorScheme();
  const { isAvailable, isLoading, signInWithApple } = useAppleAuth();

  if (Platform.OS !== 'ios' || !isAvailable) {
    return null;
  }

  const handlePress = async () => {
    haptics.light();
    const result = await signInWithApple();

    if (result.success) {
      haptics.success();
      onSuccess?.();
    } else if (result.error && result.error !== 'Cancelled') {
      haptics.error();
      onError?.(result.error);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={
        colorScheme === 'dark'
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={12}
      style={[{ width: '100%', height: 50 }, isLoading && { opacity: 0.7 }]}
      onPress={handlePress}
    />
  );
}
