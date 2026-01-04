import { useAppearance } from '@/providers/appearance-provider';

/**
 * Web-specific hook that uses our AppearanceProvider context.
 * Returns 'light' or 'dark' based on current appearance setting.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useAppearance();
  return colorScheme;
}
