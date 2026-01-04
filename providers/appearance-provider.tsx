import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { Platform, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppearanceMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'appearance-mode';

// Storage abstraction
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
};

/** Get system color scheme preference */
function getSystemScheme(): 'light' | 'dark' {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (Platform.OS !== 'web') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return 'light';
}

/** Resolve mode to actual scheme */
function resolveScheme(mode: AppearanceMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemScheme();
  }
  return mode;
}

/** Apply color scheme to platform */
function applyColorScheme(mode: AppearanceMode): void {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const isDark = resolveScheme(mode) === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    return;
  }
  if (Platform.OS !== 'web') {
    const scheme = mode === 'system' ? 'unspecified' : mode;
    Appearance.setColorScheme(scheme);
  }
}

type AppearanceContextType = {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  isLoading: boolean;
  colorScheme: 'light' | 'dark';
};

const AppearanceContext = createContext<AppearanceContextType | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => resolveScheme('system'));
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get(STORAGE_KEY);
        if (saved && ['system', 'light', 'dark'].includes(saved)) {
          const savedMode = saved as AppearanceMode;
          setModeState(savedMode);
          setColorScheme(resolveScheme(savedMode));
          applyColorScheme(savedMode);
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (mode !== 'system') return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setColorScheme(e.matches ? 'dark' : 'light');
        applyColorScheme('system');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (Platform.OS !== 'web') {
      const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
        setColorScheme(newScheme === 'dark' ? 'dark' : 'light');
      });
      return () => subscription.remove();
    }
  }, [mode]);

  const setMode = useCallback((newMode: AppearanceMode) => {
    setModeState(newMode);
    const resolved = resolveScheme(newMode);
    setColorScheme(resolved);
    applyColorScheme(newMode);
    storage.set(STORAGE_KEY, newMode).catch(() => {});
  }, []);

  return (
    <AppearanceContext.Provider value={{ mode, setMode, isLoading, colorScheme }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
}
