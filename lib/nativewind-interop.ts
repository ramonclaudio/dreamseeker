import { styled } from 'nativewind';
import { BlurView } from 'expo-blur';

/**
 * Configure third-party components for NativeWind v5 className support
 * Import this file at app entry point (app/_layout.tsx)
 *
 * In v5, cssInterop is replaced by styled():
 * styled(Component, { className: 'style' }) === cssInterop(Component, { className: { target: 'style' } })
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
styled(BlurView as any, { className: 'style' });
