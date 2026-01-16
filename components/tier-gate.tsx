import { type ReactNode } from 'react';
import { View, Pressable, Text } from 'react-native';

import { IconSymbol } from './ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { type TierKey, type FeatureKey, TIER_NAMES, meetsMinTier, hasFeature, getMinTierForFeature } from '@/convex/schema/tiers';

type TierGateProps = {
  children: ReactNode;
  minTier?: TierKey;
  feature?: FeatureKey;
  fallback?: ReactNode;
  hideOnDeny?: boolean;
};

export function TierGate({ children, minTier, feature, fallback, hideOnDeny = false }: TierGateProps) {
  const { tier, isLoading, showUpgrade } = useSubscription();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const requiredTier = minTier ?? (feature ? getMinTierForFeature(feature) : 'free');
  const hasAccess = feature ? hasFeature(tier, feature) : meetsMinTier(tier, requiredTier);

  if (isLoading) return null;
  if (hasAccess) return <>{children}</>;
  if (hideOnDeny) return null;
  if (fallback) return <>{fallback}</>;

  return (
    <Pressable style={{ borderRadius: Radius.lg, borderCurve: 'continuous', borderWidth: 1, padding: 16, backgroundColor: colors.muted, borderColor: colors.border }} onPress={showUpgrade}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }}>
          <IconSymbol name="lock.fill" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{TIER_NAMES[requiredTier]} Feature</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Upgrade to {TIER_NAMES[requiredTier]} to unlock
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export function UpgradePrompt({ feature, minTier, title, description }: {
  feature?: FeatureKey;
  minTier?: TierKey;
  title?: string;
  description?: string;
}) {
  const { showUpgrade } = useSubscription();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const requiredTier = minTier ?? (feature ? getMinTierForFeature(feature) : 'starter');

  return (
    <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: Radius.lg, borderCurve: 'continuous', borderWidth: 1, backgroundColor: colors.card, borderColor: colors.border }} onPress={showUpgrade}>
      <IconSymbol name="sparkles" size={24} color={colors.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{title ?? `Unlock ${TIER_NAMES[requiredTier]} Features`}</Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          {description ?? `Upgrade to ${TIER_NAMES[requiredTier]} to access this and more`}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.md, borderCurve: 'continuous', backgroundColor: colors.primary }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryForeground }}>Upgrade</Text>
      </View>
    </Pressable>
  );
}
