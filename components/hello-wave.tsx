import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/ui/themed-text';
import { FontSize, LineHeight } from '@/constants/layout';
import { Duration } from '@/constants/ui';
import { useAccessibilitySettings } from '@/hooks/use-accessibility-settings';

const emojiStyle = { fontSize: FontSize['6xl'], lineHeight: LineHeight['4xl'], marginTop: -6 };

export function HelloWave() {
  const { reduceMotion } = useAccessibilitySettings();

  if (reduceMotion) {
    return <ThemedText style={emojiStyle}>👋</ThemedText>;
  }

  return (
    <Animated.View
      style={{
        animationName: { '50%': { transform: [{ rotate: '25deg' }] } },
        animationIterationCount: 4,
        animationDuration: `${Duration.slow}ms`,
      }}>
      <ThemedText style={emojiStyle}>👋</ThemedText>
    </Animated.View>
  );
}
