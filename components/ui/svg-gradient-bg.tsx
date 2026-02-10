import { memo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

type SvgGradientBgProps = {
  colors: [string, string];
  width: number;
  height: number;
  direction?: 'vertical' | 'diagonal';
};

export const SvgGradientBg = memo(function SvgGradientBg({
  colors: [color1, color2],
  width,
  height,
  direction = 'vertical',
}: SvgGradientBgProps) {
  const x2 = direction === 'diagonal' ? '100%' : '0%';
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2={x2} y2="100%">
          <Stop offset="0%" stopColor={color1} />
          <Stop offset="100%" stopColor={color2} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
    </Svg>
  );
});
