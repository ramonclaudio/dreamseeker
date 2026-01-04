import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Ensure deep links always have index as the initial route
export const unstable_settings = {
  initialRouteName: 'index',
};

// Alias for cleaner JSX (SDK 55 canary doesn't export Icon/Label directly)
const Icon = NativeTabs.Trigger.Icon;
const Label = NativeTabs.Trigger.Label;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Dynamic colors for iOS liquid glass (adapts to light/dark backgrounds)
  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ dark: 'white', light: 'black' })
      : colors.text;

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ dark: 'white', light: 'black' })
      : colors.tint;

  // Web-specific styling (iOS uses liquid glass)
  const tabBarBg = Platform.OS === 'web' ? colors.card : undefined;
  const indicatorBg = Platform.OS === 'web' ? colors.muted : undefined;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{ color: labelColor }}
      tintColor={tintColor}
      backgroundColor={tabBarBg}
      indicatorColor={indicatorBg}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <Icon sf={{ default: 'checklist', selected: 'checklist' }} />
        <Label>Tasks</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: 'paperplane', selected: 'paperplane.fill' }} />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
