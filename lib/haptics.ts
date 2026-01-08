import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  selection: () => supported && Haptics.selectionAsync(),
  light: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  rigid: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  soft: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  success: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
