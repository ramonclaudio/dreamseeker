import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ModalContent({ isPresented, colors }: { isPresented: boolean; colors: typeof Colors.light }) {
  return (
    <View style={styles.content}>
      <ThemedText type="title">Modal</ThemedText>
      <ThemedText style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 8 }}>
        This modal uses a blur background on iOS and web.
      </ThemedText>
      {isPresented ? (
        <Link href="../" style={styles.link}>
          <ThemedText type="link">Dismiss</ThemedText>
        </Link>
      ) : (
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go home</ThemedText>
        </Link>
      )}
    </View>
  );
}

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const tint = colorScheme === 'dark' ? 'dark' : 'light';

  // Check if modal has navigation context (wasn't accessed via direct URL)
  const isPresented = router.canGoBack();

  // Android doesn't support blur without BlurTargetView, so use solid background
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ModalContent isPresented={isPresented} colors={colors} />
        <StatusBar style="auto" />
      </View>
    );
  }

  // iOS and web get blur background
  return (
    <BlurView intensity={80} tint={tint} style={styles.container}>
      <ModalContent isPresented={isPresented} colors={colors} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
  },
});
