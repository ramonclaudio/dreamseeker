import * as AppleAuthentication from "expo-apple-authentication";
import { useAppleAuth } from "@/hooks/use-apple-auth";
import { haptics } from "@/lib/haptics";
import { Size } from "@/constants/ui";
import { Radius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function AppleSignInButton({ onSuccess, onError }: Props) {
  const colorScheme = useColorScheme();
  const { isAvailable, isLoading, signInWithApple } = useAppleAuth();

  if (process.env.EXPO_OS !== "ios" || !isAvailable) {
    return null;
  }

  const handlePress = async () => {
    haptics.light();
    const result = await signInWithApple();

    if (result.success) {
      haptics.success();
      onSuccess?.();
    } else if (result.error && result.error !== "Cancelled") {
      haptics.error();
      onError?.(result.error);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={
        colorScheme === "dark"
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={Radius.lg}
      style={[{ width: "100%", height: Size.appleButton }, isLoading && { opacity: 0.7 }]}
      onPress={handlePress}
    />
  );
}
