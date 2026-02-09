import { View, type ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-color-scheme';

interface GradientProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function GradientProgressBar({
  progress,
  height = 8,
  color,
  style,
}: GradientProgressBarProps) {
  const colors = useColors();
  const fillColor = color ?? colors.primary;
  const radius = height / 2;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        {
          height,
          backgroundColor: colors.surfaceTinted,
          borderRadius: radius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress * 100}%`,
          borderRadius: radius,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}
