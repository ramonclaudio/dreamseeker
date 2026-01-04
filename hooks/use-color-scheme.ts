import { useColorScheme as useNwColorScheme } from 'nativewind';

/**
 * Wrapper around NativeWind's useColorScheme that returns 'light' or 'dark'.
 * Respects user's appearance preference when set via AppearanceProvider.
 * Defaults to 'light' when the color scheme is null or undefined.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useNwColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}
