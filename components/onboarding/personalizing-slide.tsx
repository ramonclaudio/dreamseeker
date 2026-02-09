import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import type { SlideColors } from './shared';

const MESSAGES = [
  'Analyzing your goals...',
  'Building your action plan...',
  'Personalizing your experience...',
  'Almost there...',
];

const CYCLE_MS = 800;
const TOTAL_DURATION_MS = 2500;

export function PersonalizingSlide({
  colors,
  onComplete,
}: {
  colors: SlideColors;
  onComplete: () => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const opacity = useSharedValue(1);
  const completeCalled = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const interval = setInterval(() => {
      // Fade out
      opacity.value = withTiming(0, { duration: 200 });

      const fadeTimer = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        // Fade in
        opacity.value = withTiming(1, { duration: 200 });
      }, 200);
      timers.push(fadeTimer);
    }, CYCLE_MS);

    const timeout = setTimeout(() => {
      if (!completeCalled.current) {
        completeCalled.current = true;
        onComplete();
      }
    }, TOTAL_DURATION_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      timers.forEach(clearTimeout);
    };
  }, [onComplete, opacity]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <ActivityIndicator size="large" color={colors.accentBlue} />
      <Animated.View style={animatedStyle}>
        <ThemedText
          style={{ fontSize: FontSize['3xl'], fontWeight: '600', textAlign: 'center' }}
        >
          {MESSAGES[messageIndex]}
        </ThemedText>
      </Animated.View>
    </View>
  );
}
