import { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, TouchTarget } from '@/constants/layout';
import { Radius } from '@/constants/theme';

export default function SubscribeScreen() {
  const colors = useColors();
  const { isPremium, isLoading } = useSubscription();

  useEffect(() => {
    if (isLoading) return;

    // Present native paywall if user doesn't have premium entitlement
    RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'premium',
    })
      .then(() => {
        router.back();
      })
      .catch((error) => {
        if (__DEV__) console.error('[Subscribe] Paywall error:', error);
        router.back();
      });
  }, [isLoading]);

  // Show premium confirmation if already subscribed
  if (isPremium) {
    return (
      <>
        <Stack.Screen options={{ title: 'Premium' }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.centeredContent}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <ThemedText variant="title" style={styles.textCenter}>
              You&apos;re Premium!
            </ThemedText>
            <ThemedText style={styles.textCenter} color={colors.mutedForeground}>
              Thank you for supporting Expo Starter App. You have access to all
              premium features.
            </ThemedText>
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
                Go Back
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  // Loading state while checking subscription or presenting paywall
  return (
    <>
      <Stack.Screen options={{ title: 'Upgrade', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  textCenter: {
    textAlign: 'center',
  },
  button: {
    minHeight: TouchTarget.min,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
