import { useEffect, useState, useCallback, useMemo } from "react";
import { Appearance, useColorScheme as useRNColorScheme, AccessibilityInfo } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Colors, type ColorPalette } from "@/constants/theme";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

const storage = {
  get: async (key: string) =>
    process.env.EXPO_OS === "web" ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) =>
    process.env.EXPO_OS === "web"
      ? localStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
};

let globalMode: ThemeMode = "system";
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateGlobalMode(newMode: ThemeMode) {
  globalMode = newMode;
  if (process.env.EXPO_OS !== "web") {
    Appearance.setColorScheme(newMode === "system" ? "unspecified" : newMode);
  }
  storage.set(STORAGE_KEY, newMode).catch(() => {});
  notifyListeners();
}

// Initialize from storage on module load
(async () => {
  try {
    const saved = await storage.get(STORAGE_KEY);
    if (saved && ["system", "light", "dark"].includes(saved)) {
      globalMode = saved as ThemeMode;
      if (process.env.EXPO_OS !== "web") {
        Appearance.setColorScheme(globalMode === "system" ? "unspecified" : globalMode);
      }
      notifyListeners();
    }
  } catch {
    /* ignore */
  }
})();

export function useColorScheme(): "light" | "dark" {
  const systemScheme = useRNColorScheme();
  const resolved = systemScheme === "dark" ? "dark" : "light";
  return globalMode === "system" ? resolved : globalMode;
}

export function useThemeMode(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
  const [mode, setModeState] = useState<ThemeMode>(globalMode);

  useEffect(() => {
    const listener = () => setModeState(globalMode);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    updateGlobalMode(newMode);
    setModeState(newMode);
  }, []);

  return { mode, setMode };
}

// Returns colors with high contrast support
export function useColors(): ColorPalette {
  const colorScheme = useColorScheme();
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (process.env.EXPO_OS !== "ios") return;

    // Check initial state - boldText is a proxy for "Increase Contrast" on iOS
    AccessibilityInfo.isBoldTextEnabled().then(setHighContrast);

    const subscription = AccessibilityInfo.addEventListener("boldTextChanged", setHighContrast);
    return () => subscription.remove();
  }, []);

  return useMemo(() => {
    if (highContrast) {
      return colorScheme === "dark" ? Colors.darkHighContrast : Colors.lightHighContrast;
    }
    return Colors[colorScheme];
  }, [colorScheme, highContrast]);
}
