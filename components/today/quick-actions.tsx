import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

function QuickActionCard({
  icon,
  iconColor,
  title,
  subtitle,
  borderColor,
  onPress,
  colors,
}: {
  icon: IconSymbolName;
  iconColor: string;
  title: string;
  subtitle: string;
  borderColor: string;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => ({
        marginBottom: Spacing.lg,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <MaterialCard
        style={{
          padding: Spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: `${iconColor}15`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol name={icon} size={IconSize["2xl"]} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }}>
            {title}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            {subtitle}
          </ThemedText>
        </View>
        <IconSymbol
          name="chevron.right"
          size={IconSize.lg}
          color={colors.mutedForeground}
        />
      </MaterialCard>
    </Pressable>
  );
}

export function QuickActions({ colors }: { colors: ColorPalette }) {
  return (
    <>
      <QuickActionCard
        icon="timer"
        iconColor={colors.accent}
        title="Lock In & Focus"
        subtitle="Deep work earns +15 XP"
        borderColor={colors.accent}
        onPress={() => router.push("/(app)/focus-timer")}
        colors={colors}
      />
      <QuickActionCard
        icon="book.fill"
        iconColor={colors.gold}
        title="Journal Your Thoughts"
        subtitle="Process your wins — earn +10 XP"
        borderColor={colors.gold}
        onPress={() => router.push("/(app)/journal-entry")}
        colors={colors}
      />
      <QuickActionCard
        icon="square.grid.2x2"
        iconColor={colors.primary}
        title="Vision Board"
        subtitle="Visualize your dream life"
        borderColor={colors.primary}
        onPress={() => router.push("/(app)/(tabs)/boards")}
        colors={colors}
      />
    </>
  );
}
