/**
 * TierGate - Conditional rendering based on subscription tier
 * Similar to Better Auth's subscription gating pattern
 */

import { type ReactNode } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import {
  type TierKey,
  type FeatureKey,
  TIER_NAMES,
  meetsMinTier,
  hasFeature,
  getMinTierForFeature,
} from '@/convex/schema/tiers';

type TierGateProps = {
  children: ReactNode;
  /** Minimum tier required (e.g., 'starter', 'plus', 'pro') */
  minTier?: TierKey;
  /** Specific feature required (alternative to minTier) */
  feature?: FeatureKey;
  /** Custom fallback when access denied */
  fallback?: ReactNode;
  /** If true, show nothing instead of fallback when denied */
  hideOnDeny?: boolean;
};

/**
 * Gate content based on subscription tier or feature
 *
 * @example
 * ```tsx
 * // Require minimum tier
 * <TierGate minTier="plus">
 *   <AdvancedFeature />
 * </TierGate>
 *
 * // Require specific feature
 * <TierGate feature="dataExport">
 *   <ExportButton />
 * </TierGate>
 *
 * // Custom fallback
 * <TierGate minTier="pro" fallback={<UpgradePrompt />}>
 *   <ProFeature />
 * </TierGate>
 *
 * // Hide completely if no access
 * <TierGate minTier="pro" hideOnDeny>
 *   <ProOnlyButton />
 * </TierGate>
 * ```
 */
export function TierGate({
  children,
  minTier,
  feature,
  fallback,
  hideOnDeny = false,
}: TierGateProps) {
  const { tier, isLoading, showUpgrade } = useSubscription();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Determine required tier
  const requiredTier = minTier ?? (feature ? getMinTierForFeature(feature) : 'free');

  // Check access
  const hasAccess = feature
    ? hasFeature(tier, feature)
    : meetsMinTier(tier, requiredTier);

  // Loading state - show nothing to prevent flash
  if (isLoading) {
    return null;
  }

  // Has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // No access - hide completely if requested
  if (hideOnDeny) {
    return null;
  }

  // No access - show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // No access - show default upgrade prompt
  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.muted, borderColor: colors.border }]}
      onPress={showUpgrade}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <IconSymbol name="lock.fill" size={20} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {TIER_NAMES[requiredTier]} Feature
          </ThemedText>
          <ThemedText style={[styles.description, { color: colors.mutedForeground }]}>
            Upgrade to {TIER_NAMES[requiredTier]} to unlock this feature
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

/**
 * Inline component to show upgrade prompt for a feature
 */
export function UpgradePrompt({
  feature,
  minTier,
  title,
  description,
}: {
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
    <Pressable
      style={[styles.promptContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={showUpgrade}
    >
      <IconSymbol name="sparkles" size={24} color={colors.primary} />
      <View style={styles.promptText}>
        <ThemedText style={styles.promptTitle}>
          {title ?? `Unlock ${TIER_NAMES[requiredTier]} Features`}
        </ThemedText>
        <ThemedText style={[styles.promptDescription, { color: colors.mutedForeground }]}>
          {description ?? `Upgrade to ${TIER_NAMES[requiredTier]} to access this and more`}
        </ThemedText>
      </View>
      <View style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={[styles.upgradeButtonText, { color: colors.primaryForeground }]}>
          Upgrade
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  promptText: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  promptDescription: {
    fontSize: 13,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
