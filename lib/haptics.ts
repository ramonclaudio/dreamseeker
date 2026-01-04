import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  /** Light tap for selections, toggles */
  selection: () => {
    if (isHapticsSupported) Haptics.selectionAsync();
  },

  /** Light impact for button presses */
  light: () => {
    if (isHapticsSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Medium impact for confirmations */
  medium: () => {
    if (isHapticsSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Heavy impact for significant actions */
  heavy: () => {
    if (isHapticsSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /** Rigid impact for UI boundaries */
  rigid: () => {
    if (isHapticsSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  },

  /** Soft impact for gentle feedback */
  soft: () => {
    if (isHapticsSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  },

  /** Success notification (task complete, sign in success) */
  success: () => {
    if (isHapticsSupported)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Warning notification (destructive action confirmation) */
  warning: () => {
    if (isHapticsSupported)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /** Error notification (validation error, failed action) */
  error: () => {
    if (isHapticsSupported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
