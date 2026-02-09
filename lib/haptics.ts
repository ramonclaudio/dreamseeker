import * as Haptics from "expo-haptics";

const supported = process.env.EXPO_OS === "ios";

export const haptics = {
  selection: () => supported && Haptics.selectionAsync(),
  light: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => supported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => supported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
