import { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius } from '@/constants/theme';
import { PAID_TIERS, TIER_KEYS, TIERS, getPriceId, type TierKey, type BillingPeriod } from '@/constants/subscriptions';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

const billingOptionStyle = { flex: 1, paddingVertical: 12, borderRadius: Radius.md, borderCurve: 'continuous' as const, alignItems: 'center' as const, justifyContent: 'center' as const };
const tierCardStyle = { padding: 16, borderRadius: Radius.lg, borderCurve: 'continuous' as const, position: 'relative' as const, gap: 4 };
const featureRowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 };

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { subscribe, loading, tier: currentTier } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedTier, setSelectedTier] = useState<Exclude<TierKey, 'free'>>('plus');

  const handleSubscribe = async () => {
    const priceId = getPriceId(selectedTier, billingPeriod);
    if (!priceId) {
      Alert.alert('Not configured', 'Stripe price ID is not configured for this tier.');
      return;
    }
    haptics.medium();
    const result = await subscribe(priceId);
    if (result.error) {
      const message = result.error instanceof Error ? result.error.message : 'Failed to start checkout';
      Alert.alert('Error', message);
    }
  };

  const handleRestore = () => {
    haptics.light();
    const message = 'Restore is for users who previously subscribed. If you subscribed on another device, make sure you\'re signed in with the same account.';
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Restore Purchases', message, [{ text: 'OK' }]);
    }
  };

  const currentTierIndex = TIER_KEYS.indexOf(currentTier);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
        <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)' }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ alignItems: 'center', marginBottom: 24, gap: 8 }}>
          <ThemedText variant="title" style={{ textAlign: 'center' }}>
            Choose Your Plan
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', fontSize: 16, lineHeight: 22 }} color={colors.mutedForeground}>
            Unlock more features and boost your productivity.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', borderRadius: Radius.lg, borderCurve: 'continuous', padding: 4, marginBottom: 20, backgroundColor: colors.muted }} accessibilityRole="radiogroup" accessibilityLabel="Billing period">
          <Pressable
            style={[
              billingOptionStyle,
              billingPeriod === 'monthly' && { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', backgroundColor: colors.background },
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('monthly');
            }}
            accessibilityRole="radio"
            accessibilityLabel="Monthly billing"
            accessibilityState={{ selected: billingPeriod === 'monthly' }}
          >
            <ThemedText style={{ fontSize: 15, fontWeight: '600' }} color={billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground}>
              Monthly
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              billingOptionStyle,
              billingPeriod === 'annual' && { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', backgroundColor: colors.background },
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('annual');
            }}
            accessibilityRole="radio"
            accessibilityLabel="Annual billing"
            accessibilityState={{ selected: billingPeriod === 'annual' }}
          >
            <ThemedText style={{ fontSize: 15, fontWeight: '600' }} color={billingPeriod === 'annual' ? colors.foreground : colors.mutedForeground}>
              Annual
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ gap: 12, marginBottom: 20 }}>
          {PAID_TIERS.map((tierConfig) => {
            const isSelected = selectedTier === tierConfig.key;
            const tierIndex = TIER_KEYS.indexOf(tierConfig.key);
            const isDowngrade = tierIndex <= currentTierIndex;
            const isCurrent = tierConfig.key === currentTier;
            const pricing = tierConfig.pricing!;

            return (
              <Pressable
                key={tierConfig.key}
                style={[
                  tierCardStyle,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  if (!isCurrent && !isDowngrade) {
                    haptics.light();
                    setSelectedTier(tierConfig.key as Exclude<TierKey, 'free'>);
                  }
                }}
                disabled={isCurrent || isDowngrade}
                accessibilityRole="radio"
                accessibilityLabel={`${tierConfig.name} plan, ${billingPeriod === 'monthly' ? pricing.monthly.amount : pricing.annual.amount} per ${billingPeriod === 'monthly' ? 'month' : 'year'}`}
                accessibilityState={{ selected: isSelected, disabled: isCurrent || isDowngrade }}
                accessibilityHint={isCurrent ? 'This is your current plan' : isDowngrade ? 'You cannot downgrade to this plan' : `Double tap to select ${tierConfig.name} plan`}
              >
                {tierConfig.popular && (
                  <View style={{ position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.primary }}>
                    <ThemedText style={{ fontSize: 11, fontWeight: '600' }} color={colors.primaryForeground}>
                      Popular
                    </ThemedText>
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', lineHeight: 24 }}>{tierConfig.name}</ThemedText>
                  {isCurrent && (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.muted }}>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600' }} color={colors.mutedForeground}>
                        Current
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <ThemedText style={{ fontSize: 28, fontWeight: '700', lineHeight: 34 }}>
                    {billingPeriod === 'monthly' ? pricing.monthly.amount : pricing.annual.amount}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, marginLeft: 2 }} color={colors.mutedForeground}>
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </ThemedText>
                </View>

                <ThemedText style={{ fontSize: 14 }} color={colors.mutedForeground}>
                  {tierConfig.limitLabel}
                </ThemedText>

                <View style={{ gap: 8 }}>
                  {tierConfig.features.map((feature) => (
                    <View key={feature} style={featureRowStyle}>
                      <IconSymbol name="checkmark" size={14} color={colors.primary} />
                      <ThemedText style={{ fontSize: 14 }} color={colors.mutedForeground}>
                        {feature}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={{ paddingVertical: 16, borderRadius: Radius.lg, borderCurve: 'continuous', alignItems: 'center', marginBottom: 12, backgroundColor: colors.primary }}
          onPress={handleSubscribe}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={loading ? 'Loading' : `Subscribe to ${TIERS[selectedTier].name}`}
          accessibilityState={{ disabled: loading }}
        >
          <ThemedText style={{ fontSize: 17, fontWeight: '600' }} color={colors.primaryForeground}>
            {loading ? 'Loading...' : `Subscribe to ${TIERS[selectedTier].name}`}
          </ThemedText>
        </Pressable>

        <Pressable onPress={handleRestore} style={{ alignItems: 'center', paddingVertical: 12 }} accessibilityRole="button" accessibilityLabel="Restore purchases" accessibilityHint="Restore previous subscription purchases">
          <ThemedText style={{ fontSize: 14 }} color={colors.mutedForeground}>
            Restore Purchases
          </ThemedText>
        </Pressable>

        <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <ThemedText style={{ fontSize: 12, textAlign: 'center', lineHeight: 18 }} color={colors.mutedForeground}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}
