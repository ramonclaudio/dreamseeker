import { useAppearance } from '@/providers/appearance-provider';

/**
 * Returns 'light' or 'dark' based on current appearance setting.
 * Triggers re-render when theme changes.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useAppearance();
  return colorScheme;
}
