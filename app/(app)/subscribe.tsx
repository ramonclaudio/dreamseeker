import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Typography } from '@/constants/theme';
import { PAID_TIERS, TIER_KEYS, TIERS, getPriceId, type TierKey } from '@/constants/subscriptions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

type BillingPeriod = 'monthly' | 'annual';

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={[Typography.title, styles.title, { color: colors.text }]}>
            Choose Your Plan
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Unlock more features and boost your productivity.
          </Text>
        </View>

        <View style={[styles.billingToggle, { backgroundColor: colors.muted }]}>
          <Pressable
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && [styles.billingOptionSelected, { backgroundColor: colors.background }],
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('monthly');
            }}
          >
            <Text
              style={[
                styles.billingOptionLabel,
                { color: billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground },
              ]}
            >
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.billingOption,
              billingPeriod === 'annual' && [styles.billingOptionSelected, { backgroundColor: colors.background }],
            ]}
            onPress={() => {
              haptics.light();
              setBillingPeriod('annual');
            }}
          >
            <Text
              style={[
                styles.billingOptionLabel,
                { color: billingPeriod === 'annual' ? colors.foreground : colors.mutedForeground },
              ]}
            >
              Annual
            </Text>
          </Pressable>
        </View>

        <View style={styles.tiersContainer}>
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
                  styles.tierCard,
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
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.popularText, { color: colors.primaryForeground }]}>
                      Popular
                    </Text>
                  </View>
                )}

                <View style={styles.tierHeader}>
                  <Text style={[styles.tierName, { color: colors.text }]}>{tierConfig.name}</Text>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.currentText, { color: colors.mutedForeground }]}>
                        Current
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.text }]}>
                    {billingPeriod === 'monthly' ? pricing.monthly.amount : pricing.annual.amount}
                  </Text>
                  <Text style={[styles.pricePeriod, { color: colors.mutedForeground }]}>
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </Text>
                </View>

                <Text style={[styles.taskLimit, { color: colors.mutedForeground }]}>
                  {tierConfig.taskLimitLabel}
                </Text>

                <View style={styles.featuresList}>
                  {tierConfig.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <IconSymbol name="checkmark" size={14} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.mutedForeground }]}>
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
          style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          <Text style={[styles.subscribeButtonText, { color: colors.primaryForeground }]}>
            {loading ? 'Loading...' : `Subscribe to ${TIERS[selectedTier].name}`}
          </Text>
        </Pressable>

        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
            Restore Purchases
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 },
  closeButton: { padding: 4 },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', marginBottom: 24 },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', fontSize: 16, lineHeight: 22 },
  billingToggle: { flexDirection: 'row', borderRadius: Radius.lg, padding: 4, marginBottom: 20 },
  billingOption: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  billingOptionSelected: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  billingOptionLabel: { fontSize: 15, fontWeight: '600' },
  tiersContainer: { gap: 12, marginBottom: 20 },
  tierCard: { padding: 16, borderRadius: Radius.lg, position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm },
  popularText: { fontSize: 11, fontWeight: '600' },
  tierHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tierName: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  currentText: { fontSize: 11, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  pricePeriod: { fontSize: 14, marginLeft: 2 },
  taskLimit: { fontSize: 14, marginBottom: 12 },
  featuresList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14 },
  subscribeButton: { paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 12 },
  subscribeButtonText: { fontSize: 17, fontWeight: '600' },
  restoreButton: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 14 },
  footer: { marginTop: 16, paddingHorizontal: 20 },
  footerText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
