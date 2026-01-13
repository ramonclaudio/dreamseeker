import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'sign-in' };

// Note: Auth routing is handled by Stack.Protected in the root layout.
// When isAuthenticated becomes true, Stack.Protected guard fails and
// the user is automatically redirected. No explicit Redirect needed here.

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
