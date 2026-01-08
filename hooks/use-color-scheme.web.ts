import { useTheme } from '@/providers/theme-provider';

/**
 * Web-specific hook that uses our ThemeProvider context.
 * Returns 'light' or 'dark' based on current theme setting.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useTheme();
  return colorScheme;
}
