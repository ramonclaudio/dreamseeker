import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '@/hooks/use-network';
import { Colors } from '@/constants/theme';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: Colors.dark.destructive, paddingTop: insets.top }}>
      <View style={{ paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>No internet connection</Text>
      </View>
    </View>
  );
}
