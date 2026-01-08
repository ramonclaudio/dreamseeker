import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { Platform, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';

const storage = {
  get: async (key: string) => Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) => Platform.OS === 'web' ? localStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
};

const getSystemScheme = (): 'light' | 'dark' => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (Platform.OS !== 'web') return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  return 'light';
};

const resolveScheme = (mode: ThemeMode): 'light' | 'dark' => mode === 'system' ? getSystemScheme() : mode;

const applyColorScheme = (mode: ThemeMode) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const isDark = resolveScheme(mode) === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } else if (Platform.OS !== 'web') {
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
  }
};

type ThemeContextType = { mode: ThemeMode; setMode: (mode: ThemeMode) => void; isLoading: boolean; colorScheme: 'light' | 'dark' };
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => resolveScheme('system'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get(STORAGE_KEY);
        if (saved && ['system', 'light', 'dark'].includes(saved)) {
          const savedMode = saved as ThemeMode;
          setModeState(savedMode);
          setColorScheme(resolveScheme(savedMode));
          applyColorScheme(savedMode);
        }
      } catch { /* ignore */ } finally { setIsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => { setColorScheme(e.matches ? 'dark' : 'light'); applyColorScheme('system'); };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else if (Platform.OS !== 'web') {
      const sub = Appearance.addChangeListener(({ colorScheme: s }) => setColorScheme(s === 'dark' ? 'dark' : 'light'));
      return () => sub.remove();
    }
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setColorScheme(resolveScheme(newMode));
    applyColorScheme(newMode);
    storage.set(STORAGE_KEY, newMode).catch(() => {});
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode, isLoading, colorScheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
