/** Shared constants for all share cards to ensure visual consistency. */

import { IconSize } from '@/constants/layout';
import type { ShareCardSparkle } from '@/components/engagement/share-card-shell';

export const SHARE_CARD = {
  WIDTH: 390,
  HEIGHT: 700,
  GRADIENT: ['#E8A87C', '#E07B4F'] as [string, string],
  RADIAL_GLOW: {
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    color: 'rgba(255,215,0,0.10)',
  },
  GLASS_OVERLAY: 'rgba(255,255,255,0.04)',
  CTA: 'Start seeking \u2726 dreamseekerapp.com',

  // Text colors
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: 'rgba(255,255,255,0.7)',
  TEXT_TERTIARY: 'rgba(255,255,255,0.5)',

  // Accent colors
  GOLD: '#FFD700',

  // Glass card
  GLASS_BG: 'rgba(255,255,255,0.12)',
  GLASS_BORDER: 'rgba(255,255,255,0.12)',

  // Icon ring (hero circle)
  ICON_RING_OUTER: 120,
  ICON_RING_INNER: 100,
  ICON_RING_BORDER: 'rgba(255,255,255,0.2)',
  ICON_RING_BG: 'rgba(255,255,255,0.15)',

  // Progress bar
  PROGRESS_HEIGHT: 8,
  PROGRESS_TRACK: 'rgba(255,255,255,0.15)',
  PROGRESS_FILL: '#FFD700',

  // XP chip
  XP_CHIP_BG: 'rgba(255,215,0,0.15)',
  XP_CHIP_BORDER: 'rgba(255,215,0,0.2)',

  // Sparkle colors
  SPARKLE_WHITE_25: 'rgba(255,255,255,0.25)',
  SPARKLE_WHITE_15: 'rgba(255,255,255,0.15)',
  SPARKLE_GOLD_20: 'rgba(255,215,0,0.2)',
  SPARKLE_WHITE_12: 'rgba(255,255,255,0.12)',
} as const;

/** Default 4-sparkle config shared by most cards. */
export const DEFAULT_SPARKLES: ShareCardSparkle[] = [
  { icon: 'sparkles', size: IconSize['2xl'], color: SHARE_CARD.SPARKLE_WHITE_25, position: { top: 60, right: 35 } },
  { icon: 'sparkles', size: IconSize.lg, color: SHARE_CARD.SPARKLE_WHITE_15, position: { top: 110, left: 25 } },
  { icon: 'sparkles', size: IconSize.md, color: SHARE_CARD.SPARKLE_GOLD_20, position: { bottom: 160, right: 25 } },
  { icon: 'sparkles', size: IconSize.lg, color: SHARE_CARD.SPARKLE_WHITE_12, position: { bottom: 190, left: 30 } },
];
