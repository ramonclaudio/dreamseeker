import { type ReactNode } from 'react';
import { View, Pressable } from 'react-native';

import { GlassControl } from './ui/glass-control';
import { IconSymbol } from './ui/icon-symbol';
import { ThemedText } from './ui/themed-text';
import { IconSize, Spacing, TouchTarget, FontSize } from '@/constants/layout';
import { Size } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';
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
  const colors = useColors();

  const requiredTier = minTier ?? (feature ? getMinTierForFeature(feature) : 'free');
  const hasAccess = feature ? hasFeature(tier, feature) : meetsMinTier(tier, requiredTier);

  if (isLoading) return null;
  if (hasAccess) return <>{children}</>;
  if (hideOnDeny) return null;
  if (fallback) return <>{fallback}</>;

  return (
    <GlassControl isInteractive>
      <Pressable
        style={{ padding: Spacing.lg, minHeight: TouchTarget.min }}
        onPress={showUpgrade}
        accessibilityRole="button"
        accessibilityLabel={`Unlock ${TIER_NAMES[requiredTier]} feature`}
        accessibilityHint="Opens upgrade options"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ width: Size.iconContainer, height: Size.iconContainer, borderRadius: Size.iconContainer / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }}>
            <IconSymbol name="lock.fill" size={IconSize.xl} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: Spacing.xxs }}>
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>{TIER_NAMES[requiredTier]} Feature</ThemedText>
            <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
              Upgrade to {TIER_NAMES[requiredTier]} to unlock
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
        </View>
      </Pressable>
    </GlassControl>
  );
}

export function UpgradePrompt({ feature, minTier, title, description }: {
  feature?: FeatureKey;
  minTier?: TierKey;
  title?: string;
  description?: string;
}) {
  const { showUpgrade } = useSubscription();
  const colors = useColors();
  const requiredTier = minTier ?? (feature ? getMinTierForFeature(feature) : 'starter');

  return (
    <GlassControl isInteractive>
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, minHeight: TouchTarget.min }}
        onPress={showUpgrade}
        accessibilityRole="button"
        accessibilityLabel={title ?? `Unlock ${TIER_NAMES[requiredTier]} features`}
        accessibilityHint="Opens upgrade options"
      >
        <IconSymbol name="sparkles" size={IconSize['3xl']} color={colors.primary} />
        <View style={{ flex: 1, gap: Spacing.xxs }}>
          <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>{title ?? `Unlock ${TIER_NAMES[requiredTier]} Features`}</ThemedText>
          <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
            {description ?? `Upgrade to ${TIER_NAMES[requiredTier]} to access this and more`}
          </ThemedText>
        </View>
        <GlassControl isInteractive style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}>
          <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }}>Upgrade</ThemedText>
        </GlassControl>
      </Pressable>
    </GlassControl>
  );
}
