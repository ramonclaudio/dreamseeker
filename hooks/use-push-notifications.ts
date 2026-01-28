import { useEffect, useRef, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

const DEVICE_ID_KEY = "push_device_id";

let initialNotificationResponse: Notifications.NotificationResponse | null = null;
let lastResponsePromiseResolved = false;
const lastResponsePromise = Notifications.getLastNotificationResponseAsync()
  .then((response) => {
    initialNotificationResponse = response;
    lastResponsePromiseResolved = true;
    return response;
  })
  .catch((error) => {
    if (__DEV__) console.warn("[Push] Failed to get last notification response:", error);
    lastResponsePromiseResolved = true;
    return null;
  });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getOrCreateDeviceId(): Promise<string> {
  const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (stored) return stored;

  let deviceId: string;
  if (process.env.EXPO_OS === "ios") {
    deviceId = (await Application.getIosIdForVendorAsync()) ?? crypto.randomUUID();
  } else {
    deviceId = Application.getAndroidId() ?? crypto.randomUUID();
  }

  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.log("[Push] Must use physical device");
    return null;
  }

  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
    });
  }

  const permissionResponse = await Notifications.getPermissionsAsync();
  let finalStatus = permissionResponse.status;

  // Check iOS-specific status for granular permission handling
  if (process.env.EXPO_OS === "ios" && permissionResponse.ios) {
    const iosStatus = permissionResponse.ios.status;
    if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
      if (__DEV__) console.log("[Push] iOS permission denied");
      return null;
    }
    if (iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      if (__DEV__) console.log("[Push] iOS provisional permission - notifications will be silent");
    }
  }

  if (finalStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: false, // Request full permissions, not provisional
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    if (__DEV__) console.log("[Push] Permission denied");
    return null;
  }

  // Constants is always defined, expoConfig/easConfig can be null
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    if (__DEV__) console.log("[Push] No project ID");
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (__DEV__) console.log("[Push] Token:", token);
    return token;
  } catch (error) {
    if (__DEV__) console.log("[Push] Error:", error);
    return null;
  }
}

export function usePushNotifications() {
  const { isAuthenticated } = useConvexAuth();
  const savePushToken = useMutation(api.notifications.savePushToken);
  const removePushToken = useMutation(api.notifications.removePushToken);
  const lastTokenRef = useRef<string | null>(null);
  const registrationInProgress = useRef(false);

  const register = useCallback(async () => {
    if (registrationInProgress.current) return;
    registrationInProgress.current = true;

    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      if (token !== lastTokenRef.current) {
        const platform = process.env.EXPO_OS as "ios" | "android";
        const deviceId = await getOrCreateDeviceId();
        await savePushToken({ token, platform, deviceId });
        lastTokenRef.current = token;
        if (__DEV__) console.log("[Push] Token saved");
      }
    } finally {
      registrationInProgress.current = false;
    }
  }, [savePushToken]);

  const unregister = useCallback(async () => {
    if (lastTokenRef.current) {
      await removePushToken({ token: lastTokenRef.current });
      lastTokenRef.current = null;
    }
  }, [removePushToken]);

  useEffect(() => {
    if (isAuthenticated) {
      register();
    }
  }, [isAuthenticated, register]);

  useEffect(() => {
    if (!isAuthenticated && lastTokenRef.current) {
      lastTokenRef.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        register();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, register]);

  return { register, unregister };
}

export function useNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void,
) {
  const onNotificationRef = useRef(onNotification);
  const onResponseRef = useRef(onResponse);
  const initialHandled = useRef(false);

  useEffect(() => {
    onNotificationRef.current = onNotification;
    onResponseRef.current = onResponse;
  });

  // Handle initial notification response captured at module level
  useEffect(() => {
    if (initialHandled.current) return;
    initialHandled.current = true;

    lastResponsePromise.then((response) => {
      if (response && onResponseRef.current) {
        onResponseRef.current(response);
      }
    });
  }, []);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      if (__DEV__) console.log("[Push] Received:", notification.request.content);
      onNotificationRef.current?.(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      if (__DEV__) console.log("[Push] Response:", response.notification.request.content.data);
      onResponseRef.current?.(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
}

export async function getInitialNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  await lastResponsePromise;
  return initialNotificationResponse;
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  delaySeconds = 0,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger:
      delaySeconds > 0
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds }
        : null,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

export { Notifications };
