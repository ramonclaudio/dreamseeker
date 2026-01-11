import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useMutation } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.log('[Push] Must use physical device');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.log('[Push] Permission denied');
    return null;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    if (__DEV__) console.log('[Push] No project ID');
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (__DEV__) console.log('[Push] Token:', token);
    return token;
  } catch (error) {
    if (__DEV__) console.log('[Push] Error:', error);
    return null;
  }
}

export function usePushNotifications() {
  const { isAuthenticated } = useConvexAuth();
  const savePushToken = useMutation(api.notifications.savePushToken);
  const tokenSavedRef = useRef(false);

  const register = useCallback(async () => {
    if (tokenSavedRef.current) return;

    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const platform = Platform.OS as 'ios' | 'android';
    await savePushToken({ token, platform });
    tokenSavedRef.current = true;
  }, [savePushToken]);

  useEffect(() => {
    if (isAuthenticated && !tokenSavedRef.current) {
      register();
    }
  }, [isAuthenticated, register]);

  useEffect(() => {
    if (!isAuthenticated) {
      tokenSavedRef.current = false;
    }
  }, [isAuthenticated]);

  return { register };
}

export function useNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      if (__DEV__) console.log('[Push] Received:', notification.request.content);
      onNotification?.(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      if (__DEV__) console.log('[Push] Response:', response.notification.request.content.data);
      onResponse?.(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [onNotification, onResponse]);
}

export { Notifications };
