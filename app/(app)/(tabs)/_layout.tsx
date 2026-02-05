import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";

import { useColors } from "@/hooks/use-color-scheme";
import { useTabBadges } from "@/hooks/use-tab-badges";

export const unstable_settings = { initialRouteName: "(home)" };

const Icon = NativeTabs.Trigger.Icon;
const Label = NativeTabs.Trigger.Label;
const Badge = NativeTabs.Trigger.Badge;

export default function TabLayout() {
  const colors = useColors();
  const badges = useTabBadges();

  const dynamicColor =
    process.env.EXPO_OS === "ios"
      ? DynamicColorIOS({ dark: "white", light: "black" })
      : colors.text;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
      labelStyle={{ color: dynamicColor }}
      tintColor={dynamicColor}
      backgroundColor={process.env.EXPO_OS === "web" ? colors.card : undefined}
      indicatorColor={process.env.EXPO_OS === "web" ? colors.muted : undefined}
    >
      {/* Dreams Tab (Home) */}
      <NativeTabs.Trigger name="(home)">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} md="auto_fix_high" />
        <Label>Dreams</Label>
        {badges.home !== null && <Badge>{badges.home}</Badge>}
      </NativeTabs.Trigger>

      {/* Today Tab */}
      <NativeTabs.Trigger name="today">
        <Icon sf={{ default: "sun.max", selected: "sun.max.fill" }} md="wb_sunny" />
        <Label>Today</Label>
        {badges.today !== null && <Badge>{badges.today}</Badge>}
      </NativeTabs.Trigger>

      {/* Discover Tab (formerly Explore) */}
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "lightbulb", selected: "lightbulb.fill" }} md="lightbulb_outline" />
        <Label>Discover</Label>
        {badges.explore !== null && <Badge>{badges.explore}</Badge>}
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <Label>Profile</Label>
        {badges.profile !== null && <Badge>{badges.profile}</Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
