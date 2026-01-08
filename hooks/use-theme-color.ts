import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: keyof typeof Colors.light) {
  const theme = useColorScheme();
  return props[theme] ?? Colors[theme][colorName];
}
