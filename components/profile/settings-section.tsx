import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize } from "@/constants/layout";
import { Opacity, Size } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

const settingsItemStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  padding: Spacing.lg,
  minHeight: TouchTarget.min,
};

const settingsItemLeftStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: Spacing.md,
};

export const settingsDividerStyle = {
  height: Size.divider,
  marginLeft: Size.dividerMargin
};

const settingsSectionTitleStyle = {
  fontSize: FontSize.md,
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  marginLeft: Spacing.md,
};

const settingsSectionContentStyle = {
  borderRadius: Radius.lg,
  borderCurve: "continuous" as const,
  overflow: "hidden" as const,
};

const sectionStyle = {
  marginTop: Spacing["2xl"],
  paddingHorizontal: Spacing.xl,
  gap: Spacing.sm
};

export function SettingsItem({
  icon,
  label,
  onPress,
  destructive,
  showChevron = true,
  colors,
}: {
  icon: Parameters<typeof IconSymbol>[0]["name"];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  colors: ColorPalette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [settingsItemStyle, { opacity: pressed ? Opacity.pressed : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={settingsItemLeftStyle}>
        <IconSymbol
          name={icon}
          size={IconSize["2xl"]}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
        <ThemedText
          style={{ fontSize: FontSize.xl }}
          color={destructive ? colors.destructive : colors.text}
        >
          {label}
        </ThemedText>
      </View>
      {showChevron && (
        <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

export function SettingsLinkItem({
  href,
  icon,
  label,
  colors,
}: {
  href: "/profile/notifications" | "/profile/privacy" | "/profile/help" | "/profile/about";
  icon: Parameters<typeof IconSymbol>[0]["name"];
  label: string;
  colors: ColorPalette;
}) {
  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(href);
    haptics.light();
  };

  if (process.env.EXPO_OS !== "ios") {
    return (
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [settingsItemStyle, { opacity: pressed ? Opacity.pressed : 1 }]}
          accessibilityRole="link"
          accessibilityLabel={label}
        >
          <View style={settingsItemLeftStyle}>
            <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
            <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={href} style={settingsItemStyle}>
      <Link.Trigger>
        <View style={settingsItemLeftStyle}>
          <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
        </View>
      </Link.Trigger>
      <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction title="Copy Link" icon="doc.on.doc" onPress={handleCopyLink} />
      </Link.Menu>
    </Link>
  );
}

export function SettingsSection({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: ColorPalette;
}) {
  return (
    <View style={sectionStyle}>
      {title && (
        <ThemedText style={settingsSectionTitleStyle} color={colors.mutedForeground}>
          {title}
        </ThemedText>
      )}
      <MaterialCard style={settingsSectionContentStyle}>{children}</MaterialCard>
    </View>
  );
}
