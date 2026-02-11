import { useState } from "react";
import { View, Pressable, Alert, ActivityIndicator } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { SettingsSection } from "@/components/profile/settings-section";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

export function SubscriptionSection({
  isPremium,
  dreamLimit,
  dreamCount,
  isTrialActive,
  trialDaysRemaining,
  hasTrialExpired,
  showUpgrade,
  showCustomerCenter,
  restorePurchases,
  colors,
}: {
  isPremium: boolean;
  dreamLimit: number | null;
  dreamCount: number;
  isTrialActive: boolean;
  trialDaysRemaining: number | null;
  hasTrialExpired: boolean;
  showUpgrade: () => void;
  showCustomerCenter: () => void;
  restorePurchases: () => Promise<boolean>;
  colors: ColorPalette;
}) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchases = async () => {
    if (isRestoring) return;

    setIsRestoring(true);
    haptics.light();

    try {
      const hasPremium = await restorePurchases();
      haptics.success();

      const message = hasPremium
        ? 'Your Premium subscription has been restored!'
        : 'No previous purchases found. If you believe this is an error, please contact support.';

      Alert.alert('Restore Purchases', message);
    } catch {
      haptics.error();
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please check your connection and try again.'
      );
    } finally {
      setIsRestoring(false);
    }
  };
  return (
    <SettingsSection title="Subscription" colors={colors}>
      <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1, marginRight: Spacing.md }}>
            <IconSymbol
              name="star.fill"
              size={IconSize["2xl"]}
              color={isPremium ? colors.primary : colors.mutedForeground}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: FontSize.xl, fontWeight: "600" }}>
                {isPremium ? "Premium" : "Free"}
              </ThemedText>
              <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
                {isTrialActive
                  ? `Trial ends in ${trialDaysRemaining ?? 0} ${trialDaysRemaining === 1 ? 'day' : 'days'}`
                  : isPremium
                    ? "Unlimited dreams"
                    : hasTrialExpired
                      ? "Trial ended \u2014 subscribe for $3.99/mo"
                      : "3-day free trial, then $3.99/mo"}
              </ThemedText>
            </View>
          </View>
          {isTrialActive ? (
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              <Pressable
                style={({ pressed }) => ({
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: Radius.md,
                  borderCurve: "continuous",
                  backgroundColor: colors.primary,
                  opacity: pressed ? Opacity.pressed : 1,
                })}
                onPress={() => {
                  haptics.medium();
                  showUpgrade();
                }}
                accessibilityRole="button"
                accessibilityLabel="Subscribe now"
              >
                <ThemedText
                  style={{ fontSize: FontSize.base, fontWeight: "600" }}
                  color={colors.primaryForeground}
                >
                  Subscribe
                </ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: Radius.md,
                  borderCurve: "continuous",
                  backgroundColor: colors.secondary,
                  opacity: pressed ? Opacity.pressed : 1,
                })}
                onPress={() => {
                  haptics.light();
                  showCustomerCenter();
                }}
                accessibilityRole="button"
                accessibilityLabel="Manage subscription"
              >
                <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                  Manage
                </ThemedText>
              </Pressable>
            </View>
          ) : isPremium ? (
            <Pressable
              style={({ pressed }) => ({
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.lg,
                borderRadius: Radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.secondary,
                opacity: pressed ? Opacity.pressed : 1,
              })}
              onPress={() => {
                haptics.light();
                showCustomerCenter();
              }}
              accessibilityRole="button"
              accessibilityLabel="Manage subscription"
            >
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                Manage
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => ({
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.lg,
                borderRadius: Radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.primary,
                opacity: pressed ? Opacity.pressed : 1,
              })}
              onPress={() => {
                haptics.medium();
                showUpgrade();
              }}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Premium"
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "600" }}
                color={colors.primaryForeground}
              >
                {hasTrialExpired ? "Subscribe" : "Start Free Trial"}
              </ThemedText>
            </Pressable>
          )}
        </View>

        {!isPremium && (
          <Pressable
            style={({ pressed }) => ({
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderRadius: Radius.md,
              borderCurve: "continuous",
              backgroundColor: colors.secondary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.sm,
              opacity: pressed ? Opacity.pressed : 1,
              borderWidth: 1,
              borderColor: colors.border,
            })}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            {isRestoring ? (
              <>
                <ActivityIndicator size="small" color={colors.mutedForeground} />
                <ThemedText
                  style={{ fontSize: FontSize.base, fontWeight: "500" }}
                  color={colors.mutedForeground}
                >
                  Restoring...
                </ThemedText>
              </>
            ) : (
              <>
                <IconSymbol
                  name="arrow.clockwise"
                  size={IconSize.md}
                  color={colors.foreground}
                />
                <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                  Restore Purchases
                </ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>
    </SettingsSection>
  );
}
