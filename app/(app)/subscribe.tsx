import { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius } from '@/constants/theme';
import { FontSize, LineHeight, MaxWidth, Spacing, TouchTarget, HitSlop } from '@/constants/layout';
import { Shadow, Size } from '@/constants/ui';
import { PAID_TIERS, TIER_KEYS, TIERS, getPriceId, type TierKey, type BillingPeriod } from '@/constants/subscriptions';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

const billingOptionStyle = { flex: 1, paddingVertical: Spacing.md, minHeight: TouchTarget.min, borderRadius: Radius.md, borderCurve: 'continuous' as const, alignItems: 'center' as const, justifyContent: 'center' as const };
const tierCardStyle = { padding: Spacing.lg, minHeight: TouchTarget.min, borderRadius: Radius.lg, borderCurve: 'continuous' as const, position: 'relative' as const, gap: Spacing.xs };
const featureRowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.sm };

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
      <View style={{ alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.sm }}>
        <View style={{ width: Size.dragHandle.width, height: Size.dragHandle.height, borderRadius: Size.dragHandle.radius, backgroundColor: colors.separator }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Math.max(Spacing.xl, insets.bottom), maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ alignItems: 'center', marginBottom: Spacing['2xl'], gap: Spacing.sm }}>
          <ThemedText variant="title" style={{ textAlign: 'center' }}>
            Choose Your Plan
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', fontSize: FontSize.xl, lineHeight: LineHeight.relaxed }} color={colors.mutedForeground}>
            Unlock more features and boost your productivity.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', borderRadius: Radius.lg, borderCurve: 'continuous', padding: Spacing.xs, marginBottom: Spacing.xl, backgroundColor: colors.muted }} accessibilityRole="radiogroup" accessibilityLabel="Billing period">
          <Pressable
            style={[
              billingOptionStyle,
              billingPeriod === 'monthly' && { boxShadow: `${Shadow.sm} ${colors.shadow}`, backgroundColor: colors.background },
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('monthly');
            }}
            accessibilityRole="radio"
            accessibilityLabel="Monthly billing"
            accessibilityState={{ selected: billingPeriod === 'monthly' }}
          >
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }} color={billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground}>
              Monthly
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              billingOptionStyle,
              billingPeriod === 'annual' && { boxShadow: `${Shadow.sm} ${colors.shadow}`, backgroundColor: colors.background },
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('annual');
            }}
            accessibilityRole="radio"
            accessibilityLabel="Annual billing"
            accessibilityState={{ selected: billingPeriod === 'annual' }}
          >
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }} color={billingPeriod === 'annual' ? colors.foreground : colors.mutedForeground}>
              Annual
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ gap: Spacing.md, marginBottom: Spacing.xl }}>
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
                  <View style={{ position: 'absolute', top: -HitSlop.md, right: Spacing.lg, paddingHorizontal: HitSlop.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.primary }}>
                    <ThemedText style={{ fontSize: FontSize.xs, fontWeight: '600' }} color={colors.primaryForeground}>
                      Popular
                    </ThemedText>
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '700', lineHeight: LineHeight.loose }} numberOfLines={1}>{tierConfig.name}</ThemedText>
                  {isCurrent && (
                    <View style={{ paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.muted }}>
                      <ThemedText style={{ fontSize: FontSize.xs, fontWeight: '600' }} color={colors.mutedForeground}>
                        Current
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <ThemedText style={{ fontSize: FontSize['6xl'], fontWeight: '700', lineHeight: LineHeight['3xl'] }}>
                    {billingPeriod === 'monthly' ? pricing.monthly.amount : pricing.annual.amount}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.base, marginLeft: 2 }} color={colors.mutedForeground}>
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </ThemedText>
                </View>

                <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
                  {tierConfig.limitLabel}
                </ThemedText>

                <View style={{ gap: Spacing.sm }}>
                  {tierConfig.features.map((feature) => (
                    <View key={feature} style={featureRowStyle}>
                      <IconSymbol name="checkmark" size={FontSize.base} color={colors.primary} />
                      <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
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
          style={{ paddingVertical: Spacing.lg, minHeight: TouchTarget.min, borderRadius: Radius.lg, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, backgroundColor: colors.primary }}
          onPress={handleSubscribe}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={loading ? 'Loading' : `Subscribe to ${TIERS[selectedTier].name}`}
          accessibilityState={{ disabled: loading }}
        >
          <ThemedText style={{ fontSize: FontSize['2xl'], fontWeight: '600' }} color={colors.primaryForeground}>
            {loading ? 'Loading...' : `Subscribe to ${TIERS[selectedTier].name}`}
          </ThemedText>
        </Pressable>

        <Pressable onPress={handleRestore} style={{ alignItems: 'center', paddingVertical: Spacing.md, minHeight: TouchTarget.min, justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Restore purchases" accessibilityHint="Restore previous subscription purchases">
          <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
            Restore Purchases
          </ThemedText>
        </Pressable>

        <View style={{ marginTop: Spacing.lg, paddingHorizontal: Spacing.xl }}>
          <ThemedText style={{ fontSize: FontSize.sm, textAlign: 'center', lineHeight: LineHeight.tight }} color={colors.mutedForeground}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}
