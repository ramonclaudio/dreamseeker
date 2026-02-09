import { View, Pressable, Alert, StyleSheet } from "react-native";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

export function BadgeGallery() {
  const colors = useColors();
  const badges = useQuery(api.badges.getBadgeProgress);

  if (!badges || badges.length === 0) return null;

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <View style={styles.container}>
      <ThemedText
        style={styles.sectionHeader}
        color={colors.mutedForeground}
      >
        Badges ({earnedCount}/{badges.length})
      </ThemedText>
      <MaterialCard style={[styles.card, { backgroundColor: colors.surfaceTinted }]}>
        <View style={styles.grid}>
          {badges.map((badge) => (
            <Pressable
              key={badge.key}
              onPress={() => {
                haptics.selection();
                Alert.alert(
                  badge.title,
                  `${badge.description}${badge.earned ? "\n\nYou earned this!" : "\n\nKeep pushing — this one's waiting for you"}`
                );
              }}
              style={styles.badgeItem}
              accessibilityLabel={`${badge.title}${badge.earned ? ", earned" : ", locked"}`}
            >
              <View
                style={[
                  styles.badgeIcon,
                  {
                    backgroundColor: badge.earned
                      ? `${colors.primary}20`
                      : colors.secondary,
                    opacity: badge.earned ? 1 : 0.3,
                  },
                ]}
              >
                <IconSymbol
                  name={(badge.icon as IconSymbolName) ?? "star.fill"}
                  size={IconSize["3xl"]}
                  color={badge.earned ? colors.primary : colors.mutedForeground}
                />
                {badge.earned && (
                  <View
                    style={[
                      styles.checkmark,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <IconSymbol name="checkmark" size={10} color={colors.onColor} weight="bold" />
                  </View>
                )}
                {!badge.earned && (
                  <View
                    style={[
                      styles.lock,
                      { backgroundColor: colors.mutedForeground },
                    ]}
                  >
                    <IconSymbol name="lock.fill" size={8} color={colors.onColor} />
                  </View>
                )}
              </View>
              <ThemedText
                style={[
                  styles.badgeLabel,
                  { opacity: badge.earned ? 1 : 0.4 },
                ]}
                color={badge.earned ? colors.foreground : colors.mutedForeground}
                numberOfLines={2}
              >
                {badge.title}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </MaterialCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: FontSize.base,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  badgeItem: {
    width: "22%",
    alignItems: "center",
    gap: Spacing.xs,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  lock: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    textAlign: "center",
  },
});
