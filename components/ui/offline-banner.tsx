import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '@/hooks/use-network';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  if (!isOffline) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: colors.destructive, paddingTop: insets.top }}>
      <View style={{ paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' }}>
        <ThemedText style={{ fontSize: 13, fontWeight: '600' }} color={colors.destructiveForeground}>No internet connection</ThemedText>
      </View>
    </View>
  );
}
