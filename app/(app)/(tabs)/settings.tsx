import { Pressable, ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';
import { useQuery } from 'convex/react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authClient } from '@/lib/auth-client';
import { api } from '@/convex/_generated/api';

type SettingsItemProps = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
};

function SettingsItem({ icon, label, onPress, destructive, showChevron = true }: SettingsItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <IconSymbol
          name={icon}
          size={22}
          color={destructive ? '#ff6b6b' : colors.icon}
        />
        <ThemedText style={[styles.settingsItemLabel, destructive && styles.destructiveText]}>
          {label}
        </ThemedText>
      </View>
      {showChevron && (
        <IconSymbol name="chevron.right" size={16} color={colors.icon} />
      )}
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
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const user = useQuery(api.auth.getCurrentUser);

  const handleSignOut = () => {
    authClient.signOut();
  };

  const handleNotifications = () => {
    Alert.alert('Coming Soon', 'Notification settings will be available in a future update.');
  };

  const handlePrivacy = () => {
    Alert.alert('Coming Soon', 'Privacy settings will be available in a future update.');
  };

  const handleDeleteAccount = () => {
    const message = 'Are you sure you want to delete your account? This action cannot be undone.';

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        performDeleteAccount();
      }
    } else {
      Alert.alert('Delete Account', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDeleteAccount },
      ]);
    }
  };

  const performDeleteAccount = async () => {
    try {
      await authClient.deleteUser();
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      {user && (
        <SettingsSection>
          <View style={[styles.userCard, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              {user.name && <ThemedText type="subtitle">{user.name}</ThemedText>}
              {user.email && (
                <ThemedText style={{ color: colors.icon }}>{user.email}</ThemedText>
              )}
            </View>
          </View>
        </SettingsSection>
      )}

      <SettingsSection title="Preferences">
        <SettingsItem
          icon="paperplane.fill"
          label="Notifications"
          onPress={handleNotifications}
        />
      </SettingsSection>

      <SettingsSection title="Privacy & Security">
        <SettingsItem
          icon="checklist"
          label="Privacy"
          onPress={handlePrivacy}
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsItem
          icon="house.fill"
          label="Sign Out"
          onPress={handleSignOut}
          showChevron={false}
        />
        <SettingsItem
          icon="house.fill"
          label="Delete Account"
          onPress={handleDeleteAccount}
          destructive
          showChevron={false}
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
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 12,
    opacity: 0.6,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 16,
  },
  destructiveText: {
    color: '#ff6b6b',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
});
