import { Dimensions, I18nManager } from 'react-native';

// Spacing scale (4pt base) - use for padding, margin, gap
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// Touch target sizes (Apple HIG minimum 44pt)
export const TouchTarget = {
  min: 44,
} as const;

// Hit slop for expanding touch targets
export const HitSlop = {
  sm: 8,
  md: 10,
  lg: 12,
} as const;

// Font sizes (use Typography variants when possible)
export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 18,
  '4xl': 20,
  '5xl': 24,
  '6xl': 28,
  '7xl': 30,
} as const;

// Line heights (1.3-1.5x font size for readability)
export const LineHeight = {
  tight: 18,
  base: 20,
  relaxed: 22,
  loose: 24,
  '2xl': 26,
  '3xl': 34,
  '4xl': 38,
} as const;

// Content max widths for tablet/desktop
export const MaxWidth = {
  form: 440, // Auth forms, modals
  content: 600, // General content, settings
  wide: 800, // Full-width content
} as const;

// Responsive breakpoints
export const Breakpoint = {
  phone: 428, // iPhone Pro Max width
  tablet: 768, // iPad mini width
  desktop: 1024, // iPad Pro 11" width
} as const;

// Icon sizes
export const IconSize = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 24,
  '4xl': 32,
  '5xl': 48,
  '6xl': 64,
} as const;

// RTL support
export const isRTL = I18nManager.isRTL;

// Get current window dimensions
export function getWindowDimensions() {
  return Dimensions.get('window');
}

// Check if current device is tablet-sized
export function isTablet() {
  const { width } = getWindowDimensions();
  return width >= Breakpoint.tablet;
}

// Get responsive header height based on screen size
export function getResponsiveHeaderHeight() {
  const { height } = getWindowDimensions();
  // 25% of screen height, clamped between 200-300
  return Math.min(300, Math.max(200, height * 0.25));
}

// Get responsive avatar size based on screen width
export function getResponsiveAvatarSize(baseSize: number = 100) {
  const { width } = getWindowDimensions();
  if (width >= Breakpoint.desktop) return baseSize * 1.2; // 120 on large iPad
  if (width >= Breakpoint.tablet) return baseSize * 1.1; // 110 on tablet
  return baseSize; // 100 on phone
}
