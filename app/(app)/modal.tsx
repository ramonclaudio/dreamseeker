import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  // Check if modal has navigation context (wasn't accessed via direct URL)
  // On web, if the page was reloaded or navigated to directly, canGoBack() returns false
  const isPresented = router.canGoBack();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      {isPresented ? (
        // Modal was opened from within the app - show dismiss link
        <Link href="../" style={styles.link}>
          <ThemedText type="link">Dismiss modal</ThemedText>
        </Link>
      ) : (
        // Modal was accessed directly (e.g., via URL) - navigate to home
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      )}
      {/* iOS modal has dark background - adjust status bar to light for visibility */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
