// UI Constants - Opacity, Z-Index, Animation, Sizes

// Opacity values for interactive states
export const Opacity = {
  pressed: 0.7,
  active: 0.8,
  disabled: 0.5,
  muted: 0.6,
} as const;

// Z-index layering
export const ZIndex = {
  base: 0,
  statusBar: 1,
  dropdown: 10,
  modal: 100,
  toast: 500,
  offlineBanner: 1000,
} as const;

// Animation durations (ms)
export const Duration = {
  instant: 0,
  fast: 150,
  normal: 200,
  slow: 300,
  splash: 1000,
  confettiFall: 3000,
  confettiExplosion: 400,
} as const;

// Component sizes
export const Size = {
  checkbox: 24,
  iconContainer: 40,
  iconContainerSm: 32,
  divider: 0.5,
  dividerThick: 1,
  dividerMargin: 50,
  dragHandle: { width: 36, height: 5, radius: 3 },
  badge: 32,
  appleButton: 50,
} as const;

// Responsive image/header constants
export const Responsive = {
  header: {
    minHeight: 200,
    maxHeight: 300,
    screenRatio: 0.25,
  },
  avatar: {
    phone: 100,
    tablet: 110,
    desktop: 120,
  },
} as const;

// Confetti configuration
export const Confetti = {
  count: 150,
  originY: -20,
  fallSpeed: 3000,
  explosionSpeed: 400,
  colors: ['#c7d1dd', '#a8b5c4', '#7b8d9e', '#c4a84c', '#6b9670'],
} as const;

// Accessibility
export const Accessibility = {
  maxFontSizeMultiplier: 2,
} as const;

