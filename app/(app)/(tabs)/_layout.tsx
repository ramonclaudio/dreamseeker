import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = { initialRouteName: 'index' };

const Icon = NativeTabs.Trigger.Icon;
const Label = NativeTabs.Trigger.Label;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const dynamicColor = Platform.OS === 'ios' ? DynamicColorIOS({ dark: 'white', light: 'black' }) : colors.text;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{ color: dynamicColor }}
      tintColor={dynamicColor}
      backgroundColor={Platform.OS === 'web' ? colors.card : undefined}
      indicatorColor={Platform.OS === 'web' ? colors.muted : undefined}>
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
