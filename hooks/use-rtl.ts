import { I18nManager, type FlexStyle } from 'react-native';

/**
 * RTL (Right-to-Left) layout support
 *
 * React Native handles most RTL automatically via I18nManager, but some
 * cases need manual handling:
 * - Absolute positioned elements
 * - Custom icons/arrows that should flip
 * - Explicit left/right references
 */

// Whether the current locale is RTL (Arabic, Hebrew, Persian, etc.)
export const isRTL = I18nManager.isRTL;

// Flip a horizontal value for RTL
export function flipForRTL<T>(ltrValue: T, rtlValue: T): T {
  return isRTL ? rtlValue : ltrValue;
}

// Get the correct start/end side
export function getStartSide(): 'left' | 'right' {
  return isRTL ? 'right' : 'left';
}

export function getEndSide(): 'left' | 'right' {
  return isRTL ? 'left' : 'right';
}

// Flex direction that respects RTL
export function getRowDirection(): FlexStyle['flexDirection'] {
  return isRTL ? 'row-reverse' : 'row';
}

// Transform style for icons/images that should flip in RTL
export const rtlFlipStyle = isRTL ? { transform: [{ scaleX: -1 }] } : {};

// Helper to create RTL-aware absolute positioning
export function absolutePosition(side: 'start' | 'end', value: number) {
  if (side === 'start') {
    return isRTL ? { right: value } : { left: value };
  }
  return isRTL ? { left: value } : { right: value };
}
