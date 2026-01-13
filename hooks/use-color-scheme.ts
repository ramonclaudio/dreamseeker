import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { Appearance, useColorScheme as useRNColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';

const storage = {
  get: async (key: string) => Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) => Platform.OS === 'web' ? localStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
};

let globalMode: ThemeMode = 'system';
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Web-specific: detect system dark mode
function getWebSystemScheme(): 'light' | 'dark' {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Web-specific: subscribe to system theme changes
function subscribeToWebSystemScheme(callback: () => void): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

// Apply theme to document for web CSS
function applyWebTheme(scheme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.style.colorScheme = scheme;
  document.documentElement.setAttribute('data-theme', scheme);
}

// Initialize from storage on module load
(async () => {
  try {
    const saved = await storage.get(STORAGE_KEY);
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      globalMode = saved as ThemeMode;
      if (Platform.OS !== 'web') {
        Appearance.setColorScheme(globalMode === 'system' ? 'unspecified' : globalMode);
      }
      notifyListeners();
    }
  } catch { /* ignore */ }
})();

export function useColorScheme(): 'light' | 'dark' {
  const rnScheme = useRNColorScheme();

  // On web, use useSyncExternalStore to track system preference
  const webSystemScheme = useSyncExternalStore(
    subscribeToWebSystemScheme,
    getWebSystemScheme,
    () => 'light' // SSR fallback
  );

  const systemScheme = Platform.OS === 'web' ? webSystemScheme : rnScheme;
  const resolved = systemScheme === 'dark' ? 'dark' : 'light';
  const finalScheme = globalMode === 'system' ? resolved : globalMode;

  // Apply to document on web
  useEffect(() => {
    applyWebTheme(finalScheme);
  }, [finalScheme]);

  return finalScheme;
}

export function useThemeMode(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
  const [mode, setModeState] = useState<ThemeMode>(globalMode);

  useEffect(() => {
    const listener = () => setModeState(globalMode);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    globalMode = newMode;
    setModeState(newMode);
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(newMode === 'system' ? 'unspecified' : newMode);
    }
    storage.set(STORAGE_KEY, newMode).catch(() => {});
    notifyListeners();
  }, []);

  return { mode, setMode };
}
