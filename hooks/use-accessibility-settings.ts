import { useState, useEffect } from "react";
import { AccessibilityInfo } from "react-native";

export interface AccessibilitySettings {
  reduceMotion: boolean;
  boldText: boolean;
  reduceTransparency: boolean;
  screenReader: boolean;
  grayscale: boolean;
  invertColors: boolean;
}

const defaultSettings: AccessibilitySettings = {
  reduceMotion: false,
  boldText: false,
  reduceTransparency: false,
  screenReader: false,
  grayscale: false,
  invertColors: false,
};

export function useAccessibilitySettings(): AccessibilitySettings {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Initial fetch of all settings
    const fetchSettings = async () => {
      const [reduceMotion, boldText, reduceTransparency, screenReader, grayscale, invertColors] =
        await Promise.all([
          AccessibilityInfo.isReduceMotionEnabled(),
          process.env.EXPO_OS === "ios"
            ? AccessibilityInfo.isBoldTextEnabled()
            : Promise.resolve(false),
          process.env.EXPO_OS === "ios"
            ? AccessibilityInfo.isReduceTransparencyEnabled()
            : Promise.resolve(false),
          AccessibilityInfo.isScreenReaderEnabled(),
          process.env.EXPO_OS === "ios"
            ? AccessibilityInfo.isGrayscaleEnabled()
            : Promise.resolve(false),
          process.env.EXPO_OS === "ios"
            ? AccessibilityInfo.isInvertColorsEnabled()
            : Promise.resolve(false),
        ]);

      setSettings({
        reduceMotion,
        boldText,
        reduceTransparency,
        screenReader,
        grayscale,
        invertColors,
      });
    };

    fetchSettings();

    // Subscribe to changes
    const subscriptions = [
      AccessibilityInfo.addEventListener("reduceMotionChanged", (value) =>
        setSettings((prev) => ({ ...prev, reduceMotion: value })),
      ),
      AccessibilityInfo.addEventListener("screenReaderChanged", (value) =>
        setSettings((prev) => ({ ...prev, screenReader: value })),
      ),
    ];

    // iOS-only settings
    if (process.env.EXPO_OS === "ios") {
      subscriptions.push(
        AccessibilityInfo.addEventListener("boldTextChanged", (value) =>
          setSettings((prev) => ({ ...prev, boldText: value })),
        ),
        AccessibilityInfo.addEventListener("reduceTransparencyChanged", (value) =>
          setSettings((prev) => ({ ...prev, reduceTransparency: value })),
        ),
        AccessibilityInfo.addEventListener("grayscaleChanged", (value) =>
          setSettings((prev) => ({ ...prev, grayscale: value })),
        ),
        AccessibilityInfo.addEventListener("invertColorsChanged", (value) =>
          setSettings((prev) => ({ ...prev, invertColors: value })),
        ),
      );
    }

    return () => subscriptions.forEach((sub) => sub.remove());
  }, []);

  return settings;
}
