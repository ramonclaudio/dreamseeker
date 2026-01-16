import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabBadges } from '@/hooks/use-tab-badges';

export const unstable_settings = { initialRouteName: '(home)' };

const Icon = NativeTabs.Trigger.Icon;
const Label = NativeTabs.Trigger.Label;
const Badge = NativeTabs.Trigger.Badge;
const VectorIcon = NativeTabs.Trigger.VectorIcon;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const badges = useTabBadges();

  const dynamicColor =
    process.env.EXPO_OS === 'ios' ? DynamicColorIOS({ dark: 'white', light: 'black' }) : colors.text;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{ color: dynamicColor }}
      tintColor={dynamicColor}
      backgroundColor={process.env.EXPO_OS === 'web' ? colors.card : undefined}
      indicatorColor={process.env.EXPO_OS === 'web' ? colors.muted : undefined}>
      {/* Home Tab */}
      <NativeTabs.Trigger name="(home)">
        {process.env.EXPO_OS === 'ios' ? <Icon sf={{ default: 'house', selected: 'house.fill' }} /> : <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />}
        <Label>Home</Label>
        {badges.home !== null && <Badge>{badges.home}</Badge>}
      </NativeTabs.Trigger>

      {/* Tasks Tab */}
      <NativeTabs.Trigger name="tasks">
        {process.env.EXPO_OS === 'ios' ? <Icon sf={{ default: 'checklist', selected: 'checklist' }} /> : <Icon src={<VectorIcon family={MaterialIcons} name="checklist" />} />}
        <Label>Tasks</Label>
        {badges.tasks !== null && <Badge>{badges.tasks}</Badge>}
      </NativeTabs.Trigger>

      {/* Explore Tab */}
      <NativeTabs.Trigger name="explore">
        {process.env.EXPO_OS === 'ios' ? <Icon sf={{ default: 'paperplane', selected: 'paperplane.fill' }} /> : <Icon src={<VectorIcon family={MaterialIcons} name="explore" />} />}
        <Label>Explore</Label>
        {badges.explore !== null && <Badge>{badges.explore}</Badge>}
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        {process.env.EXPO_OS === 'ios' ? <Icon sf={{ default: 'person', selected: 'person.fill' }} /> : <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />}
        <Label>Profile</Label>
        {badges.profile !== null && <Badge>{badges.profile}</Badge>}
      </NativeTabs.Trigger>

      {/* Settings Tab */}
      <NativeTabs.Trigger name="settings">
        {process.env.EXPO_OS === 'ios' ? <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} /> : <Icon src={<VectorIcon family={MaterialIcons} name="settings" />} />}
        <Label>Settings</Label>
        {badges.settings !== null && <Badge>{badges.settings}</Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
