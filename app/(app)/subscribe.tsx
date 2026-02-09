import { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, TouchTarget, FontSize, IconSize, MaxWidth } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

export default function SubscribeScreen() {
  const colors = useColors();
  const { isPremium, isLoading, showUpgrade } = useSubscription();
  const hasPresented = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || hasPresented.current) return;
    hasPresented.current = true;

    showUpgrade().finally(() => {
      if (mountedRef.current) {
        router.back();
      }
    });
  }, [isLoading, showUpgrade]);

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
              Thank you for supporting DreamSeeker. You have access to all
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Upgrade to Premium',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText
                style={styles.headerTitle}
                color={colors.foreground}
              >
                Ready to stop playing small?
              </ThemedText>
              <ThemedText
                style={styles.headerSubtitle}
                color={colors.mutedForeground}
              >
                Unlock unlimited dreams and personalized insights to achieve everything you&apos;ve been putting off.
              </ThemedText>
            </View>

            <View style={styles.comparisonContainer}>
              <MaterialCard style={[styles.tierCard, { borderWidth: 1, borderColor: colors.border }]}>
                <View style={styles.tierHeader}>
                  <IconSymbol name="circle.fill" size={IconSize.md} color={colors.mutedForeground} />
                  <ThemedText style={styles.tierTitle} color={colors.foreground}>
                    Free
                  </ThemedText>
                </View>
                <View style={styles.tierFeatures}>
                  <FeatureRow icon="checkmark.circle.fill" text="3 active dreams" colors={colors} />
                  <FeatureRow icon="checkmark.circle.fill" text="1 journal entry per day" colors={colors} />
                  <FeatureRow icon="checkmark.circle.fill" text="Basic challenges" colors={colors} />
                  <FeatureRow icon="xmark.circle.fill" text="Personalized insights" colors={colors} isDisabled />
                  <FeatureRow icon="xmark.circle.fill" text="Unlimited dreams" colors={colors} isDisabled />
                  <FeatureRow icon="xmark.circle.fill" text="Priority support" colors={colors} isDisabled />
                </View>
              </MaterialCard>

              <MaterialCard
                style={[
                  styles.tierCard,
                  styles.premiumCard,
                  {
                    borderWidth: 2,
                    borderColor: colors.primary,
                    backgroundColor: colors.surfaceTinted,
                  }
                ]}
              >
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.badgeText} color={colors.primaryForeground}>
                    7-DAY FREE TRIAL
                  </ThemedText>
                </View>
                <View style={styles.tierHeader}>
                  <IconSymbol name="star.fill" size={IconSize.md} color={colors.primary} />
                  <ThemedText style={styles.tierTitle} color={colors.foreground}>
                    Premium
                  </ThemedText>
                </View>
                <View style={styles.tierFeatures}>
                  <FeatureRow icon="checkmark.circle.fill" text="Unlimited active dreams" colors={colors} isPremium showBadge />
                  <FeatureRow icon="checkmark.circle.fill" text="Unlimited journal entries" colors={colors} isPremium showBadge />
                  <FeatureRow icon="checkmark.circle.fill" text="Personalized insights" colors={colors} isPremium showBadge />
                  <FeatureRow icon="checkmark.circle.fill" text="Advanced challenges" colors={colors} isPremium />
                  <FeatureRow icon="checkmark.circle.fill" text="Priority support" colors={colors} isPremium />
                  <FeatureRow icon="checkmark.circle.fill" text="Early access to new features" colors={colors} isPremium />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.upgradeButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? Opacity.pressed : 1,
                    }
                  ]}
                  onPress={() => {
                    haptics.medium();
                    showUpgrade();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Start Your Free Trial"
                >
                  <ThemedText
                    style={styles.upgradeButtonText}
                    color={colors.primaryForeground}
                  >
                    Try Premium Free for 7 Days
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.trialSubtext} color={colors.mutedForeground}>
                  No commitment. Cancel anytime.
                </ThemedText>
                <ThemedText style={styles.pricingNote} color={colors.mutedForeground}>
                  After your 7-day free trial, Premium is $9.99/month
                </ThemedText>
              </MaterialCard>
            </View>

            <View style={styles.footer}>
              <ThemedText
                style={styles.footerText}
                color={colors.mutedForeground}
              >
                Join thousands of women who stopped waiting and started achieving their biggest dreams.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function FeatureRow({
  icon,
  text,
  colors,
  isDisabled = false,
  isPremium = false,
  showBadge = false,
}: {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  text: string;
  colors: ReturnType<typeof useColors>;
  isDisabled?: boolean;
  isPremium?: boolean;
  showBadge?: boolean;
}) {
  const iconColor = isDisabled
    ? colors.mutedForeground
    : isPremium
      ? colors.primary
      : colors.success;

  return (
    <View style={styles.featureRow}>
      <IconSymbol
        name={icon}
        size={IconSize.lg}
        color={iconColor}
        weight={isPremium ? 'semibold' : 'regular'}
      />
      <ThemedText
        style={[styles.featureText, isDisabled && styles.featureTextDisabled]}
        color={isDisabled ? colors.mutedForeground : colors.foreground}
      >
        {text}
      </ThemedText>
      {showBadge && <ProBadge />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    maxWidth: MaxWidth.content,
    alignSelf: 'center',
    width: '100%',
  },
  content: {
    gap: Spacing['2xl'],
  },
  header: {
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize['6xl'],
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  comparisonContainer: {
    gap: Spacing.lg,
  },
  tierCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  premiumCard: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
  },
  tierFeatures: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.base,
    flex: 1,
  },
  featureTextDisabled: {
    textDecorationLine: 'line-through',
  },
  upgradeButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  trialSubtext: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  pricingNote: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xxs,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
});
