import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/layout';
import { useColors } from '@/hooks/use-color-scheme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

const DOT_SIZE = 8;
const ACTIVE_DOT_WIDTH = 24;

function Dot({ isActive, colors }: { isActive: boolean; colors: ReturnType<typeof useColors> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? ACTIVE_DOT_WIDTH : DOT_SIZE, { duration: 200 }),
    backgroundColor: withTiming(
      interpolateColor(isActive ? 1 : 0, [0, 1], [colors.surfaceTinted, colors.primary]),
      { duration: 200 }
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
      }}
      accessibilityRole="adjustable"
      accessibilityLabel={`Onboarding progress, step ${current + 1} of ${total}`}
      accessibilityValue={{ now: current + 1, min: 1, max: total }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} isActive={i === current} colors={colors} />
      ))}
    </View>
  );
}
