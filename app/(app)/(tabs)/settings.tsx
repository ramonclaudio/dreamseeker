import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
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

function ChangePasswordModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: (typeof Colors)['light'];
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearError = () => setError(null);

  const handleChangePassword = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (authError) {
        const message = authError.message ?? 'Failed to change password';
        if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong')) {
          setError('Current password is incorrect');
        } else {
          setError(message);
        }
      } else {
        setSuccess(true);
        setTimeout(handleClose, 2000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <ThemedText style={{ color: colors.tint }}>Cancel</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Change Password</ThemedText>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <ThemedText style={styles.successText}>Password changed successfully!</ThemedText>
            </View>
          )}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Current Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter current password"
              placeholderTextColor={colors.icon}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>New Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter new password"
              placeholderTextColor={colors.icon}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.icon}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Pressable
            style={[
              styles.changeButton,
              { backgroundColor: colors.tint, opacity: isLoading || success ? 0.7 : 1 },
            ]}
            onPress={handleChangePassword}
            disabled={isLoading || success}>
            <ThemedText style={styles.changeButtonText}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.hint, { color: colors.icon }]}>
            For security, you will remain signed in on this device. All other sessions will be signed out.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const user = useQuery(api.auth.getCurrentUser);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
    <>
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
            icon="lock.fill"
            label="Change Password"
            onPress={() => setShowChangePassword(true)}
          />
          <SettingsItem
            icon="checklist"
            label="Privacy"
            onPress={handlePrivacy}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsItem
            icon="rectangle.portrait.and.arrow.right"
            label="Sign Out"
            onPress={handleSignOut}
            showChevron={false}
          />
          <SettingsItem
            icon="trash.fill"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
            showChevron={false}
          />
        </SettingsSection>
      </ScrollView>

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        colors={colors}
      />
    </>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#22c55e',
    fontSize: 14,
    textAlign: 'center',
  },
  changeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
