import { Image } from 'expo-image';
import { Platform, View, Text } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.light.secondary, dark: Colors.dark.secondary }}
      headerImage={
        <IconSymbol
          size={310}
          color={colors.mutedForeground}
          name="chevron.left.forwardslash.chevron.right"
          style={{ bottom: -90, left: -35, position: 'absolute' }}
        />
      }>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Text style={[Typography.title, { color: colors.text, fontFamily: Fonts.rounded }]}>
          Explore
        </Text>
      </View>
      <Text style={[Typography.default, { color: colors.text }]}>This app includes example code to help you get started.</Text>
      <Collapsible title="File-based routing">
        <Text style={[Typography.default, { color: colors.text }]}>
          This app has two screens:{' '}
          <Text style={Typography.defaultSemiBold}>app/(tabs)/index.tsx</Text> and{' '}
          <Text style={Typography.defaultSemiBold}>app/(tabs)/explore.tsx</Text>
        </Text>
        <Text style={[Typography.default, { color: colors.text }]}>
          The layout file in <Text style={Typography.defaultSemiBold}>app/(tabs)/_layout.tsx</Text>{' '}
          sets up the tab navigator.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text style={[Typography.link, { color: colors.mutedForeground }]}>Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <Text style={[Typography.default, { color: colors.text }]}>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text style={Typography.defaultSemiBold}>w</Text> in the terminal running this project.
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <Text style={[Typography.default, { color: colors.text }]}>
          For static images, you can use the <Text style={Typography.defaultSemiBold}>@2x</Text> and{' '}
          <Text style={Typography.defaultSemiBold}>@3x</Text> suffixes to provide files for
          different screen densities
        </Text>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <Text style={[Typography.link, { color: colors.mutedForeground }]}>Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <Text style={[Typography.default, { color: colors.text }]}>
          This template has light and dark mode support. The{' '}
          <Text style={Typography.defaultSemiBold}>useColorScheme()</Text> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </Text>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <Text style={[Typography.link, { color: colors.mutedForeground }]}>Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <Text style={[Typography.default, { color: colors.text }]}>
          This template includes an example of an animated component. The{' '}
          <Text style={Typography.defaultSemiBold}>components/HelloWave.tsx</Text> component uses
          the powerful{' '}
          <Text style={[Typography.defaultSemiBold, { fontFamily: Fonts.mono }]}>
            react-native-reanimated
          </Text>{' '}
          library to create a waving hand animation.
        </Text>
        {Platform.select({
          ios: (
            <Text style={[Typography.default, { color: colors.text }]}>
              The <Text style={Typography.defaultSemiBold}>components/ParallaxScrollView.tsx</Text>{' '}
              component provides a parallax effect for the header image.
            </Text>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}
