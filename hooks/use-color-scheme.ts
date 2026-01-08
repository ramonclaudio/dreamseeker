import { useTheme } from '@/providers/theme-provider';

/**
 * Returns 'light' or 'dark' based on current theme setting.
 * Triggers re-render when theme changes.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useTheme();
  return colorScheme;
}
