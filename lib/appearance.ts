import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { useColorScheme as useNwColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

export type AppearanceMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'appearance-mode';

/**
 * Convert AppearanceMode to React Native ColorSchemeName.
 * 'system' maps to 'unspecified' to reset to device preference.
 */
function toColorSchemeName(mode: AppearanceMode): ColorSchemeName {
  if (mode === 'system') return 'unspecified';
  return mode;
}

/**
 * Hook for managing app appearance (light/dark/system).
 * Persists preference to SecureStore and syncs with React Native Appearance.
 */
export function useAppearance() {
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { colorScheme } = useNwColorScheme();

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved && ['system', 'light', 'dark'].includes(saved)) {
          const savedMode = saved as AppearanceMode;
          setModeState(savedMode);
          Appearance.setColorScheme(toColorSchemeName(savedMode));
        }
      } catch {
        // Ignore errors, use default
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Set mode and persist
  const setMode = async (newMode: AppearanceMode) => {
    setModeState(newMode);
    Appearance.setColorScheme(toColorSchemeName(newMode));
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, newMode);
    } catch {
      // Ignore storage errors
    }
  };

  return {
    mode,
    setMode,
    isLoading,
    resolvedScheme: colorScheme === 'dark' ? 'dark' : 'light',
  };
}
