import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ui/themed-text";
import { FontSize } from "@/constants/layout";

type XpCelebrationProps = {
  visible: boolean;
  xpAmount: number;
  color: string;
  onComplete?: () => void;
};

export function XpCelebration({
  visible,
  xpAmount,
  color,
  onComplete,
}: XpCelebrationProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Scale bounce: 0 → 1.3 → 1
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
      // Animate up and fade in/out (800ms total)
      translateY.value = withSequence(
        withTiming(-28, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(-36, { duration: 300, easing: Easing.linear })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    } else {
      // Reset
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0;
    }
  }, [visible, translateY, opacity, scale, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedText
        style={[styles.text, { color }]}
      >
        +{xpAmount} XP
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 8,
    top: "50%",
    zIndex: 10,
  },
  text: {
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
});
