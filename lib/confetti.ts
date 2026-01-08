import { createRef } from 'react';
import type ConfettiCannon from 'react-native-confetti-cannon';

export const confettiRef = createRef<ConfettiCannon>();

export function shootConfetti() {
  confettiRef.current?.start();
}
