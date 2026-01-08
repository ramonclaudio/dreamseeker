import { useTheme } from '@/providers/theme-provider';

export function useColorScheme(): 'light' | 'dark' {
  return useTheme().colorScheme;
}
