import { Image } from 'expo-image';
import { Platform, View, Text, Pressable } from 'react-native';
import { useQuery } from 'convex/react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Link } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const stepContainerStyle = { gap: 8, marginBottom: 8 };

export default function HomeScreen() {
  const user = useQuery(api.auth.getCurrentUser);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.light.secondary, dark: Colors.dark.secondary }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={{ height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' }}
        />
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[Typography.title, { color: colors.text }]}>
          {user?.name ? `Hi, ${user.name}!` : 'Welcome!'}
        </Text>
        <HelloWave />
      </View>

      <View style={stepContainerStyle}>
        <Text style={[Typography.subtitle, { color: colors.text }]}>Step 1: Try it</Text>
        <Text style={[Typography.default, { color: colors.text }]}>
          Edit <Text style={Typography.defaultSemiBold}>app/(tabs)/index.tsx</Text> to see changes.
          Press{' '}
          <Text style={Typography.defaultSemiBold}>
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </View>
      <View style={stepContainerStyle}>
        <Link href="/modal" asChild>
          <Pressable>
            <Text style={[Typography.subtitle, { color: colors.text }]}>Step 2: Explore</Text>
          </Pressable>
        </Link>
        <Text style={[Typography.default, { color: colors.text }]}>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </View>
      <View style={stepContainerStyle}>
        <Text style={[Typography.subtitle, { color: colors.text }]}>Step 3: Get a fresh start</Text>
        <Text style={[Typography.default, { color: colors.text }]}>
          {`When you're ready, run `}
          <Text style={Typography.defaultSemiBold}>npm run reset-project</Text> to get a fresh{' '}
          <Text style={Typography.defaultSemiBold}>app</Text> directory. This will move the current{' '}
          <Text style={Typography.defaultSemiBold}>app</Text> to{' '}
          <Text style={Typography.defaultSemiBold}>app-example</Text>.
        </Text>
      </View>
    </ParallaxScrollView>
  );
}
