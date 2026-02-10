import { createRef } from 'react';
import type ConfettiCannon from 'react-native-confetti-cannon';
import type { ConfettiTier } from '@/constants/ui';

export const confettiTinyRef = createRef<ConfettiCannon>();
export const confettiSmallRef = createRef<ConfettiCannon>();
export const confettiMediumRef = createRef<ConfettiCannon>();
export const confettiEpicRef = createRef<ConfettiCannon>();

/** @deprecated Use shootConfettiTier — kept for backwards compat */
export const confettiRef = confettiMediumRef;

const refMap: Record<ConfettiTier, React.RefObject<ConfettiCannon | null>> = {
  tiny: confettiTinyRef,
  small: confettiSmallRef,
  medium: confettiMediumRef,
  epic: confettiEpicRef,
};

/** Shoot confetti at a specific tier. Defaults to medium for backwards compat. */
export function shootConfetti(tier: ConfettiTier = 'medium') {
  refMap[tier]?.current?.start();
}

/** Convenience: subtle celebration for small wins */
export function shootConfettiSmall() {
  confettiSmallRef.current?.start();
}

/** Convenience: big celebration for major moments */
export function shootConfettiEpic() {
  confettiEpicRef.current?.start();
}
