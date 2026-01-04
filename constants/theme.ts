/**
 * shadcn/ui v4 color system for React Native
 * Converted from OKLCH to hex - neutral grays (new-york v4)
 */

import { Platform } from 'react-native';

/**
 * Core shadcn v4 color tokens
 * Based on globals.css OKLCH values
 */
export const Colors = {
  light: {
    background: '#ffffff', // oklch(1 0 0)
    foreground: '#171717', // oklch(0.145 0 0)
    card: '#ffffff', // oklch(1 0 0)
    cardForeground: '#171717',
    popover: '#ffffff',
    popoverForeground: '#171717',
    primary: '#262626', // oklch(0.205 0 0)
    primaryForeground: '#fafafa', // oklch(0.985 0 0)
    secondary: '#f5f5f5', // oklch(0.97 0 0)
    secondaryForeground: '#262626',
    muted: '#f5f5f5', // oklch(0.97 0 0)
    mutedForeground: '#737373', // oklch(0.556 0 0)
    accent: '#f5f5f5',
    accentForeground: '#262626',
    destructive: '#dc2626', // oklch(0.577 0.245 27.325)
    destructiveForeground: '#fafafa',
    border: '#e5e5e5', // oklch(0.922 0 0)
    input: '#e5e5e5',
    ring: '#a3a3a3', // oklch(0.708 0 0)
    // Legacy aliases
    text: '#171717',
    tint: '#262626',
    icon: '#737373',
    tabIconDefault: '#737373',
    tabIconSelected: '#262626',
  },
  dark: {
    background: '#171717', // oklch(0.145 0 0)
    foreground: '#fafafa', // oklch(0.985 0 0)
    card: '#262626', // oklch(0.205 0 0)
    cardForeground: '#fafafa',
    popover: '#333333', // oklch(0.269 0 0)
    popoverForeground: '#fafafa',
    primary: '#e5e5e5', // oklch(0.922 0 0)
    primaryForeground: '#262626', // oklch(0.205 0 0)
    secondary: '#333333', // oklch(0.269 0 0)
    secondaryForeground: '#fafafa',
    muted: '#333333', // oklch(0.269 0 0)
    mutedForeground: '#a3a3a3', // oklch(0.708 0 0)
    accent: '#404040', // oklch(0.371 0 0)
    accentForeground: '#fafafa',
    destructive: '#f87171', // oklch(0.704 0.191 22.216) - shadcn v4
    destructiveForeground: '#dc2626', // oklch(0.58 0.22 27) - shadcn v4
    border: 'rgba(255, 255, 255, 0.1)', // oklch(1 0 0 / 10%)
    input: 'rgba(255, 255, 255, 0.15)', // oklch(1 0 0 / 15%)
    ring: '#737373', // oklch(0.556 0 0)
    // Legacy aliases
    text: '#fafafa',
    tint: '#e5e5e5',
    icon: '#a3a3a3',
    tabIconDefault: '#a3a3a3',
    tabIconSelected: '#e5e5e5',
  },
};

/**
 * Spacing scale (matches Tailwind)
 */
export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

/**
 * Border radius scale (matches shadcn v4)
 * --radius: 0.625rem (10px)
 */
export const Radius = {
  none: 0,
  sm: 6, // calc(var(--radius) - 4px)
  md: 8, // calc(var(--radius) - 2px)
  DEFAULT: 10, // var(--radius)
  lg: 10, // var(--radius)
  xl: 14, // calc(var(--radius) + 4px)
  '2xl': 18,
  '3xl': 22,
  full: 9999,
};

/**
 * Font families
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
