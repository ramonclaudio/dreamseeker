import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Wrapper around React Native's useColorScheme that returns 'light' or 'dark'.
 * Defaults to 'light' when the color scheme is null, undefined, or 'unspecified'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const colorScheme = useRNColorScheme();
  // Handle null, undefined, and 'unspecified' (RN 0.83+)
  if (colorScheme === 'dark') {
    return 'dark';
  }
  return 'light';
}
