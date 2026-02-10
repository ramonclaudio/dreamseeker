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
                  badge.description
                );
              }}
              style={styles.badgeItem}
              accessibilityLabel={`${badge.title}${badge.earned ? ", earned" : ", locked"}`}
            >
              <View
                style={[
                  styles.badgeIconOuter,
                  badge.earned && {
                    borderColor: `${colors.primary}40`,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    {
                      backgroundColor: badge.earned
                        ? `${colors.primary}18`
                        : `${colors.mutedForeground}10`,
                    },
                  ]}
                >
                  <IconSymbol
                    name={(badge.icon as IconSymbolName) ?? "star.fill"}
                    size={IconSize["3xl"]}
                    color={
                      badge.earned ? colors.primary : `${colors.mutedForeground}60`
                    }
                  />
                </View>
              </View>
              {badge.earned && (
                <View
                  style={[
                    styles.checkmark,
                    {
                      backgroundColor: colors.success,
                      borderColor: colors.surfaceTinted,
                    },
                  ]}
                >
                  <IconSymbol
                    name="checkmark"
                    size={10}
                    color={colors.onColor}
                    weight="bold"
                  />
                </View>
              )}
              {!badge.earned && (
                <View
                  style={[
                    styles.lock,
                    {
                      backgroundColor: `${colors.mutedForeground}90`,
                      borderColor: colors.surfaceTinted,
                    },
                  ]}
                >
                  <IconSymbol
                    name="lock.fill"
                    size={8}
                    color={colors.onColor}
                  />
                </View>
              )}
              <ThemedText
                style={styles.badgeLabel}
                color={
                  badge.earned ? colors.foreground : `${colors.mutedForeground}80`
                }
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
    marginTop: Spacing.xl,
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
    paddingVertical: Spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    rowGap: Spacing.xl,
    columnGap: Spacing.sm,
  },
  badgeItem: {
    width: "23%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badgeIconOuter: {
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  lock: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
  },
});
