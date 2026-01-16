import { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Typography } from '@/constants/theme';
import { PAID_TIERS, TIER_KEYS, TIERS, getPriceId, type TierKey, type BillingPeriod } from '@/constants/subscriptions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

const billingOptionStyle = { flex: 1, paddingVertical: 12, borderRadius: Radius.md, borderCurve: 'continuous' as const, alignItems: 'center' as const, justifyContent: 'center' as const };
const tierCardStyle = { padding: 16, borderRadius: Radius.lg, borderCurve: 'continuous' as const, position: 'relative' as const };
const featureRowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 };

export default function SubscribeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { subscribe, loading, tier: currentTier } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedTier, setSelectedTier] = useState<Exclude<TierKey, 'free'>>('plus');

  const handleClose = () => {
    haptics.light();
    router.back();
  };

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 8, paddingTop: insets.top + 8 }}>
        <View style={{ position: 'absolute', top: 8, width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)' }} />
        <Pressable onPress={handleClose} style={{ position: 'absolute', right: 16, padding: 4 }}>
          <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={[Typography.title, { textAlign: 'center', marginBottom: 8, color: colors.text }]}>
            Choose Your Plan
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 16, lineHeight: 22, color: colors.mutedForeground }}>
            Unlock more features and boost your productivity.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', borderRadius: Radius.lg, borderCurve: 'continuous', padding: 4, marginBottom: 20, backgroundColor: colors.muted }}>
          <Pressable
            style={[
              billingOptionStyle,
              billingPeriod === 'monthly' && { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', backgroundColor: colors.background },
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('monthly');
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground }}>
              Monthly
            </Text>
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
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: billingPeriod === 'annual' ? colors.foreground : colors.mutedForeground }}>
              Annual
            </Text>
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
              >
                {tierConfig.popular && (
                  <View style={{ position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.primary }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primaryForeground }}>
                      Popular
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', lineHeight: 24, color: colors.text }}>{tierConfig.name}</Text>
                  {isCurrent && (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderCurve: 'continuous', backgroundColor: colors.muted }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.mutedForeground }}>
                        Current
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', lineHeight: 34, color: colors.text }}>
                    {billingPeriod === 'monthly' ? pricing.monthly.amount : pricing.annual.amount}
                  </Text>
                  <Text style={{ fontSize: 14, marginLeft: 2, color: colors.mutedForeground }}>
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </Text>
                </View>

                <Text style={{ fontSize: 14, marginBottom: 12, color: colors.mutedForeground }}>
                  {tierConfig.limitLabel}
                </Text>

                <View style={{ gap: 8 }}>
                  {tierConfig.features.map((feature) => (
                    <View key={feature} style={featureRowStyle}>
                      <IconSymbol name="checkmark" size={14} color={colors.primary} />
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        {feature}
                      </Text>
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
        >
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.primaryForeground }}>
            {loading ? 'Loading...' : `Subscribe to ${TIERS[selectedTier].name}`}
          </Text>
        </Pressable>

        <Pressable onPress={handleRestore} style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Restore Purchases
          </Text>
        </Pressable>

        <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 12, textAlign: 'center', lineHeight: 18, color: colors.mutedForeground }}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
