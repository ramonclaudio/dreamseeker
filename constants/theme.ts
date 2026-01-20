// Base color palettes
const lightColors = {
  background: '#ffffff',
  foreground: '#171717',
  card: '#ffffff',
  cardForeground: '#171717',
  popover: '#ffffff',
  popoverForeground: '#171717',
  primary: '#262626',
  primaryForeground: '#fafafa',
  secondary: '#f5f5f5',
  secondaryForeground: '#262626',
  muted: '#f5f5f5',
  mutedForeground: '#666666',
  accent: '#f5f5f5',
  accentForeground: '#262626',
  destructive: '#dc2626',
  destructiveForeground: '#fafafa',
  success: '#16a34a',
  successForeground: '#f0fdf4',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#a3a3a3',
  text: '#171717',
  tint: '#262626',
  icon: '#666666',
  tabIconDefault: '#666666',
  tabIconSelected: '#262626',
};

const darkColors = {
  background: '#171717',
  foreground: '#fafafa',
  card: '#262626',
  cardForeground: '#fafafa',
  popover: '#333333',
  popoverForeground: '#fafafa',
  primary: '#e5e5e5',
  primaryForeground: '#262626',
  secondary: '#333333',
  secondaryForeground: '#fafafa',
  muted: '#333333',
  mutedForeground: '#a3a3a3',
  accent: '#404040',
  accentForeground: '#fafafa',
  destructive: '#f87171',
  destructiveForeground: '#fef2f2',
  success: '#22c55e',
  successForeground: '#14532d',
  border: 'rgba(255, 255, 255, 0.1)',
  input: 'rgba(255, 255, 255, 0.15)',
  ring: '#737373',
  text: '#fafafa',
  tint: '#e5e5e5',
  icon: '#a3a3a3',
  tabIconDefault: '#a3a3a3',
  tabIconSelected: '#e5e5e5',
};

// High contrast variants (for iOS Increase Contrast setting)
// - Darker text, more saturated colors, solid borders
const lightHighContrast = {
  ...lightColors,
  foreground: '#000000',
  cardForeground: '#000000',
  popoverForeground: '#000000',
  primary: '#000000',
  secondaryForeground: '#000000',
  mutedForeground: '#4a4a4a', // Darker for better contrast (7:1+)
  accentForeground: '#000000',
  destructive: '#b91c1c', // Darker red
  success: '#15803d', // Darker green
  border: '#a3a3a3', // More visible border
  input: '#a3a3a3',
  text: '#000000',
  tint: '#000000',
  icon: '#4a4a4a',
  tabIconDefault: '#4a4a4a',
  tabIconSelected: '#000000',
};

const darkHighContrast = {
  ...darkColors,
  foreground: '#ffffff',
  cardForeground: '#ffffff',
  popoverForeground: '#ffffff',
  primary: '#ffffff',
  secondaryForeground: '#ffffff',
  mutedForeground: '#d4d4d4', // Lighter for better contrast
  accentForeground: '#ffffff',
  destructive: '#fca5a5', // Lighter red
  destructiveForeground: '#ffffff',
  success: '#4ade80', // Lighter green
  successForeground: '#000000',
  border: 'rgba(255, 255, 255, 0.3)', // More visible border
  input: 'rgba(255, 255, 255, 0.3)',
  text: '#ffffff',
  tint: '#ffffff',
  icon: '#d4d4d4',
  tabIconDefault: '#d4d4d4',
  tabIconSelected: '#ffffff',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
  lightHighContrast,
  darkHighContrast,
};

export type ColorScheme = 'light' | 'dark';
export type ColorPalette = typeof lightColors;

export const Radius = {
  none: 0,
  sm: 6,
  md: 8,
  DEFAULT: 10,
  lg: 10,
  xl: 14,
  '2xl': 18,
  '3xl': 22,
  full: 9999,
};

export const Typography = {
  default: { fontSize: 16, lineHeight: 24 },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  title: { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 32 },
  subtitle: { fontSize: 20, fontWeight: 'bold' as const },
  link: { lineHeight: 30, fontSize: 16 },
};

export const Fonts = process.env.EXPO_OS === 'ios'
  ? { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' }
  : process.env.EXPO_OS === 'web'
    ? {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      }
    : { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' };
