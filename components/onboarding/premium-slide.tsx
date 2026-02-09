import { View, StyleSheet } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GradientButton } from '@/components/ui/gradient-button';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { useSubscription } from '@/hooks/use-subscription';
import type { SlideColors } from './shared';

interface PremiumSlideProps {
  colors: SlideColors;
  bottomInset: number;
  onContinue: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: 'star.fill' as const,
    title: 'Unlimited Dreams',
    description: 'Chase as many goals as your heart desires',
  },
  {
    icon: 'book.fill' as const,
    title: 'Unlimited Journal Entries',
    description: 'Reflect on every step of your journey',
  },
  {
    icon: 'sparkles' as const,
    title: 'Personalized Insights',
    description: 'Get personalized guidance from Gabby',
  },
  {
    icon: 'heart.fill' as const,
    title: 'Priority Support',
    description: 'Direct help when you need it most',
  },
];

export function PremiumSlide({ colors, bottomInset, onContinue }: PremiumSlideProps) {
  const { showUpgrade } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const upgraded = await showUpgrade();
      if (upgraded) {
        onContinue();
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${colors.accentBlue}20`,
                borderColor: colors.accentBlue,
              },
            ]}
          >
            <IconSymbol name="sparkles" size={IconSize['3xl']} color={colors.accentBlue} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Unlock Your Full Potential
          </ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Get unlimited access to everything DreamSeeker has to offer
          </ThemedText>
        </View>

        <View style={styles.features}>
          {PREMIUM_FEATURES.map((feature) => (
            <MaterialCard key={feature.title} variant="tinted" style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: `${colors.primary}15`,
                    },
                  ]}
                >
                  <IconSymbol name={feature.icon} size={IconSize['2xl']} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText style={styles.featureDescription} color={colors.mutedForeground}>
                    {feature.description}
                  </ThemedText>
                </View>
              </View>
            </MaterialCard>
          ))}
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(bottomInset, Spacing.md) }]}>
        <GradientButton
          onPress={handleUpgrade}
          label="Start Free Trial"
          variant="primary"
          isLoading={isUpgrading}
          icon={<IconSymbol name="star.fill" size={IconSize.xl} color={colors.primaryForeground} />}
        />
        <GradientButton
          onPress={onContinue}
          label="Maybe Later"
          variant="ghost"
          disabled={isUpgrading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    gap: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: Spacing.md,
  },
  featureCard: {
    padding: Spacing.lg,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  featureTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
});
