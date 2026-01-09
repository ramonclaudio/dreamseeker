import { useTheme } from '@/providers/theme-provider';

export const useColorScheme = (): 'light' | 'dark' => useTheme().colorScheme;
