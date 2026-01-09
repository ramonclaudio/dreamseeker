import { Stack } from 'expo-router';

export default function PlusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="export" />
    </Stack>
  );
}
