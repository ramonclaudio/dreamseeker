import { Platform } from 'react-native';

export const Colors = {
  light: {
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
    mutedForeground: '#737373',
    accent: '#f5f5f5',
    accentForeground: '#262626',
    destructive: '#dc2626',
    destructiveForeground: '#fafafa',
    border: '#e5e5e5',
    input: '#e5e5e5',
    ring: '#a3a3a3',
    text: '#171717',
    tint: '#262626',
    icon: '#737373',
    tabIconDefault: '#737373',
    tabIconSelected: '#262626',
  },
  dark: {
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
    destructiveForeground: '#dc2626',
    border: 'rgba(255, 255, 255, 0.1)',
    input: 'rgba(255, 255, 255, 0.15)',
    ring: '#737373',
    text: '#fafafa',
    tint: '#e5e5e5',
    icon: '#a3a3a3',
    tabIconDefault: '#a3a3a3',
    tabIconSelected: '#e5e5e5',
  },
};

export const Spacing = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20,
  6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 14: 56, 16: 64, 20: 80,
  24: 96, 28: 112, 32: 128, 36: 144, 40: 160, 44: 176, 48: 192, 52: 208,
  56: 224, 60: 240, 64: 256, 72: 288, 80: 320, 96: 384,
};

export const Radius = {
  none: 0, sm: 6, md: 8, DEFAULT: 10, lg: 10, xl: 14, '2xl': 18, '3xl': 22, full: 9999,
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
