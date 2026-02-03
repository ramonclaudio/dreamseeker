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
      {/* Home Tab */}
      <NativeTabs.Trigger name="(home)">
        <Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <Label>Home</Label>
        {badges.home !== null && <Badge>{badges.home}</Badge>}
      </NativeTabs.Trigger>

      {/* Tasks Tab */}
      <NativeTabs.Trigger name="tasks">
        <Icon sf={{ default: "checklist", selected: "checklist" }} md="checklist" />
        <Label>Tasks</Label>
        {badges.tasks !== null && <Badge>{badges.tasks}</Badge>}
      </NativeTabs.Trigger>

      {/* Explore Tab */}
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "paperplane", selected: "paperplane.fill" }} md="explore" />
        <Label>Explore</Label>
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
