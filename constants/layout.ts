// Spacing scale (4pt base) - use for padding, margin, gap
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
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
  "2xl": 17,
  "3xl": 18,
  "4xl": 20,
  "5xl": 24,
  "6xl": 28,
  "7xl": 30,
} as const;

// Line heights (1.3-1.5x font size for readability)
export const LineHeight = {
  tight: 18,
  base: 20,
  relaxed: 22,
  loose: 24,
  "2xl": 26,
  "3xl": 34,
  "4xl": 38,
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

// Floating tab bar clearance
export const TAB_BAR_HEIGHT = 80;
/** Bottom padding for scrollable content — clears the tab bar + breathing room */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + Spacing.lg;

// Icon sizes
export const IconSize = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 22,
  "3xl": 24,
  "4xl": 32,
  "5xl": 48,
  "6xl": 64,
} as const;
