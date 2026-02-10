import Svg, { Path } from 'react-native-svg';

// Cloud paths in 200x100 viewBox — bumps on top AND bottom for full cloud shape
const CLOUD_PATHS = [
  // Classic 3-bump top, 2-bump bottom
  'M16,68 C4,68 0,54 4,42 C0,28 14,18 32,22 C38,6 58,0 76,10 C84,0 104,0 116,10 C126,2 148,4 162,16 C176,8 196,18 194,36 C200,50 194,68 178,68 C184,78 172,88 156,86 C148,94 128,96 116,88 C106,96 86,96 76,88 C64,96 44,92 38,84 C28,90 12,84 16,68 Z',
  // Soft rolling top, gentle bottom
  'M14,70 C4,70 0,56 5,42 C0,28 16,18 34,22 C40,6 62,0 80,10 C92,0 112,2 126,12 C140,4 160,8 172,20 C186,12 200,24 196,42 C200,56 192,70 176,70 C182,80 170,90 154,86 C144,94 126,96 114,88 C104,96 84,96 74,88 C62,94 42,90 36,82 C24,88 10,82 14,70 Z',
  // Tall center top, shallow bottom
  'M18,68 C6,68 0,52 5,40 C0,26 16,16 34,20 C40,4 60,0 80,8 C92,0 112,2 124,12 C138,4 158,8 168,20 C182,12 198,24 194,42 C200,54 192,68 174,68 C180,76 170,86 156,84 C146,92 130,94 118,86 C108,94 88,94 78,86 C66,92 48,88 40,80 C30,86 14,80 18,68 Z',
  // Four small bumps top, 3-bump bottom
  'M14,68 C4,68 0,54 4,42 C0,28 12,18 28,22 C32,8 48,2 62,10 C70,2 86,2 96,10 C104,2 120,2 132,10 C142,4 158,6 168,16 C182,8 198,22 196,38 C200,52 194,68 180,68 C186,78 174,88 158,86 C148,94 130,96 118,86 C106,94 86,94 74,86 C62,94 42,90 36,82 C24,86 10,80 14,68 Z',
  // Left-heavy top, offset bottom
  'M16,68 C4,68 0,54 5,40 C0,24 14,12 36,18 C42,2 64,0 84,8 C96,0 114,4 128,14 C144,6 164,10 174,24 C188,16 200,28 196,44 C200,58 192,68 176,68 C182,78 172,88 158,86 C148,94 128,96 116,88 C104,96 84,94 74,86 C62,92 44,88 36,80 C26,86 12,80 16,68 Z',
  // Right-heavy top, mixed bottom
  'M18,68 C6,68 0,52 5,40 C0,26 14,16 30,20 C36,6 52,2 68,10 C78,2 96,2 110,10 C122,2 142,0 160,10 C174,4 194,14 192,32 C198,48 190,68 172,68 C178,78 168,88 152,86 C142,94 124,96 112,86 C100,94 80,94 70,86 C58,92 40,88 34,80 C22,86 8,80 18,68 Z',
  // Gentle bumps top, soft bottom
  'M12,70 C4,70 0,56 4,44 C0,30 14,20 30,24 C36,8 54,2 72,10 C82,2 100,0 114,10 C126,2 146,4 158,16 C172,8 192,20 192,36 C198,50 192,68 176,70 C182,80 170,90 154,86 C144,94 126,96 114,86 C102,94 82,94 72,86 C60,92 42,88 34,80 C24,86 10,80 12,70 Z',
] as const;

export function CloudShape({
  fill,
  stroke,
  strokeWidth = 0,
  strokeDasharray,
  variant = 0,
}: {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  variant?: number;
}) {
  const path = CLOUD_PATHS[variant % CLOUD_PATHS.length];

  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
      <Path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    </Svg>
  );
}
