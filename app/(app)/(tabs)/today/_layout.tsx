import { Stack } from "expo-router";

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Today" }} />
    </Stack>
  );
}
