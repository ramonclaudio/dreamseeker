import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollOffset } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const H = 250;
type Props = PropsWithChildren<{ headerImage: ReactElement; headerBackgroundColor: { dark: string; light: string } }>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollOffset.value, [-H, 0, H], [-H / 2, 0, H * 0.75]) },
      { scale: interpolate(scrollOffset.value, [-H, 0, H], [2, 1, 1]) },
    ],
  }));

  const blurStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollOffset.value, [0, H * 0.5, H], [0, 0.5, 1]) }));

  return (
    <Animated.ScrollView ref={scrollRef} style={{ backgroundColor: colors.background, flex: 1 }} scrollEventThrottle={16} contentInsetAdjustmentBehavior="automatic">
      <Animated.View style={[{ height: H, overflow: 'hidden' }, { backgroundColor: headerBackgroundColor[colorScheme] }, headerStyle]}>
        {headerImage}
        {process.env.EXPO_OS !== 'android' && (
          <Animated.View style={[StyleSheet.absoluteFillObject, blurStyle]}>
            <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}
      </Animated.View>
      <View style={{ flex: 1, paddingTop: 32, paddingHorizontal: 32, paddingBottom: 40, gap: 16, overflow: 'hidden', backgroundColor: colors.background }}>{children}</View>
    </Animated.ScrollView>
  );
}
