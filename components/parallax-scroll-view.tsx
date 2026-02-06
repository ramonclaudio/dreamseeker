import type { PropsWithChildren, ReactElement } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useColorScheme, useColors } from "@/hooks/use-color-scheme";
import { useAccessibilitySettings } from "@/hooks/use-accessibility-settings";
import { Spacing, MaxWidth } from "@/constants/layout";
import { Responsive } from "@/constants/ui";

// Responsive header height: 25% of screen, clamped 200-300
function useHeaderHeight() {
  const { height } = useWindowDimensions();
  return Math.min(
    Responsive.header.maxHeight,
    Math.max(Responsive.header.minHeight, height * Responsive.header.screenRatio),
  );
}
type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const { reduceMotion } = useAccessibilitySettings();
  const H = useHeaderHeight();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {};
    }
    return {
      transform: [
        { translateY: interpolate(scrollOffset.value, [-H, 0, H], [-H / 2, 0, H * 0.75]) },
        { scale: interpolate(scrollOffset.value, [-H, 0, H], [2, 1, 1]) },
      ],
    };
  });

  const blurStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 0 };
    }
    return { opacity: interpolate(scrollOffset.value, [0, H * 0.5, H], [0, 0.5, 1]) };
  });

  const contentStyle = {
    flex: 1,
    paddingTop: Spacing["3xl"],
    paddingHorizontal: Spacing["3xl"],
    paddingBottom: Spacing["4xl"],
    gap: Spacing.lg,
    overflow: "hidden" as const,
    backgroundColor: colors.background,
    maxWidth: MaxWidth.wide,
    alignSelf: "center" as const,
    width: "100%" as const,
  };

  if (reduceMotion) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background, flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={[
            { height: H, overflow: "hidden" },
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ]}
        >
          {headerImage}
        </View>
        <View collapsable={false} style={contentStyle}>
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor: colors.background, flex: 1 }}
      scrollEventThrottle={16}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View
        style={[
          { height: H, overflow: "hidden" },
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerStyle,
        ]}
      >
        {headerImage}
        {process.env.EXPO_OS !== "android" && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: colorScheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" },
              blurStyle,
            ]}
          />
        )}
      </Animated.View>
      <View collapsable={false} style={contentStyle}>
        {children}
      </View>
    </Animated.ScrollView>
  );
}
