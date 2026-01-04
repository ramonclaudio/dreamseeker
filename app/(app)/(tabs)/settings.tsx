import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { AppearanceMode, useAppearance } from '@/lib/appearance';

type SettingsItemProps = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  colors: (typeof Colors)['light'];
};

function SettingsItem({ icon, label, onPress, destructive, colors }: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsItem, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <IconSymbol
          name={icon}
          size={22}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
        <ThemedText
          style={[styles.settingsItemLabel, destructive && { color: colors.destructive }]}>
          {label}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

type SettingsSectionProps = {
  title?: string;
  children: React.ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      {title && <ThemedText style={styles.sectionTitle}>{title}</ThemedText>}
      <GlassCard style={styles.sectionContent}>
        {children}
      </GlassCard>
    </View>
  );
}

const APPEARANCE_OPTIONS: { value: AppearanceMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type AppearancePickerProps = {
  mode: AppearanceMode;
  onModeChange: (mode: AppearanceMode) => void;
  colors: (typeof Colors)['light'];
};

function AppearancePicker({ mode, onModeChange, colors }: AppearancePickerProps) {
  return (
    <View style={styles.appearanceContainer}>
      <View style={styles.appearanceRow}>
        <IconSymbol name="moon.fill" size={22} color={colors.mutedForeground} />
        <ThemedText style={styles.settingsItemLabel}>Appearance</ThemedText>
      </View>
      <View style={[styles.segmentedControl, { backgroundColor: colors.muted }]}>
        {APPEARANCE_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.segment,
                isSelected && [styles.segmentSelected, { backgroundColor: colors.background }],
              ]}
              onPress={() => {
                haptics.light();
                onModeChange(option.value);
              }}>
              <ThemedText
                style={[
                  styles.segmentText,
                  { color: isSelected ? colors.foreground : colors.mutedForeground },
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { mode, setMode } = useAppearance();

  const handleSignOut = () => {
    haptics.medium();
    authClient.signOut();
  };

  const handleDeleteAccount = () => {
    haptics.warning();
    const message =
      'Are you sure you want to delete your account? This action cannot be undone.';

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        authClient.deleteUser();
      }
    } else {
      Alert.alert('Delete Account', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => authClient.deleteUser(),
        },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <SettingsSection title="Appearance">
        <AppearancePicker mode={mode} onModeChange={setMode} colors={colors} />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsItem
          icon="rectangle.portrait.and.arrow.right"
          label="Sign Out"
          onPress={handleSignOut}
          colors={colors}
        />
      </SettingsSection>

      <SettingsSection title="Danger Zone">
        <SettingsItem
          icon="trash.fill"
          label="Delete Account"
          onPress={handleDeleteAccount}
          destructive
          colors={colors}
        />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.6,
  },
  sectionContent: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 16,
  },
  appearanceContainer: {
    padding: 16,
    gap: 12,
  },
  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
