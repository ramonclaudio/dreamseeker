import { Redirect, Stack } from 'expo-router';
import { useConvexAuth } from 'convex/react';

export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  // Don't redirect while loading - let the sign-in page show
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
