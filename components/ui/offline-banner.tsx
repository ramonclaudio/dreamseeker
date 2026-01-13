import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '@/hooks/use-network';
import { Colors } from '@/constants/theme';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.dark.destructive,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
