import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.background }}>
        <Text style={[Typography.title, { color: colors.text }]}>This screen does not exist.</Text>
        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={[Typography.link, { color: colors.mutedForeground }]}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
