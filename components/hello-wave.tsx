import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/ui/themed-text';
import { useReduceMotion } from '@/hooks/use-accessibility-settings';

export function HelloWave() {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return (
      <ThemedText style={{ fontSize: 28, lineHeight: 32, marginTop: -6 }}>👋</ThemedText>
    );
  }

  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
