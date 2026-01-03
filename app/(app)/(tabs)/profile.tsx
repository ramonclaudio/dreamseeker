import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useQuery } from 'convex/react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authClient } from '@/lib/auth-client';
import { api } from '@/convex/_generated/api';

type ProfileFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  colors: (typeof Colors)['light'];
};

function ProfileField({ label, value, onPress, colors }: ProfileFieldProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.field,
        { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}>
      <View style={styles.fieldContent}>
        <ThemedText style={[styles.fieldLabel, { color: colors.icon }]}>{label}</ThemedText>
        <ThemedText style={styles.fieldValue}>{value || 'Not set'}</ThemedText>
      </View>
      <IconSymbol name="pencil" size={18} color={colors.icon} />
    </Pressable>
  );
}

type EditModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  colors: (typeof Colors)['light'];
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function EditModal({
  visible,
  onClose,
  title,
  label,
  value: initialValue,
  onSave,
  colors,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: EditModalProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setValue(initialValue);
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!value.trim()) {
      setError(`${label} cannot be empty`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSave(value.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
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
          <ThemedText type="subtitle">{title}</ThemedText>
          <Pressable onPress={handleSave} hitSlop={8} disabled={isLoading}>
            <ThemedText style={{ color: colors.tint, opacity: isLoading ? 0.5 : 1 }}>
              {isLoading ? 'Saving...' : 'Save'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.modalContent}>
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{label}</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.icon}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError(null);
              }}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoFocus
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
              styles.button,
              { backgroundColor: colors.tint, opacity: isLoading || success ? 0.7 : 1 },
            ]}
            onPress={handleChangePassword}
            disabled={isLoading || success}>
            <ThemedText style={styles.buttonText}>
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

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const user = useQuery(api.auth.getCurrentUser);

  const [showEditName, setShowEditName] = useState(false);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleUpdateName = async (name: string) => {
    const { error } = await authClient.updateUser({ name });
    if (error) throw new Error(error.message ?? 'Failed to update name');
  };

  const handleUpdateUsername = async (username: string) => {
    // Validate username format (3-20 chars, matching server config)
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (username.length > 20) {
      throw new Error('Username must be at most 20 characters');
    }
    const { error } = await authClient.updateUser({ username });
    if (error) {
      const message = error.message ?? '';
      if (message.toLowerCase().includes('already taken')) {
        throw new Error('Username is already taken');
      }
      throw new Error(message || 'Failed to update username');
    }
  };

  const handleUpdateEmail = async (newEmail: string) => {
    const { error } = await authClient.changeEmail({ newEmail });
    if (error) throw new Error(error.message ?? 'Failed to update email');
  };

  const avatarInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
        </ThemedView>

        {user && (
          <>
            <View style={styles.avatarSection}>
              {user.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                  <ThemedText style={styles.avatarText}>{avatarInitial}</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.icon }]}>Account Info</ThemedText>
              <View style={[styles.fieldGroup, { borderColor: colors.card }]}>
                <ProfileField
                  label="Name"
                  value={user.name || ''}
                  onPress={() => setShowEditName(true)}
                  colors={colors}
                />
                <View style={[styles.fieldDivider, { backgroundColor: colors.background }]} />
                <ProfileField
                  label="Username"
                  value={user.username ? `@${user.username}` : ''}
                  onPress={() => setShowEditUsername(true)}
                  colors={colors}
                />
                <View style={[styles.fieldDivider, { backgroundColor: colors.background }]} />
                <ProfileField
                  label="Email"
                  value={user.email || ''}
                  onPress={() => setShowEditEmail(true)}
                  colors={colors}
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.icon }]}>Security</ThemedText>
              <Pressable
                style={({ pressed }) => [
                  styles.securityItem,
                  { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setShowChangePassword(true)}>
                <View style={styles.securityItemLeft}>
                  <IconSymbol name="lock.fill" size={22} color={colors.icon} />
                  <ThemedText style={styles.securityItemLabel}>Change Password</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.icon} />
              </Pressable>
            </View>

            <EditModal
              visible={showEditName}
              onClose={() => setShowEditName(false)}
              title="Edit Name"
              label="Name"
              value={user.name || ''}
              onSave={handleUpdateName}
              colors={colors}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            <EditModal
              visible={showEditUsername}
              onClose={() => setShowEditUsername(false)}
              title="Edit Username"
              label="Username"
              value={user.username || ''}
              onSave={handleUpdateUsername}
              colors={colors}
              placeholder="Enter your username (3-20 characters)"
              autoCapitalize="none"
            />

            <EditModal
              visible={showEditEmail}
              onClose={() => setShowEditEmail(false)}
              title="Edit Email"
              label="Email"
              value={user.email || ''}
              onSave={handleUpdateEmail}
              colors={colors}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ChangePasswordModal
              visible={showChangePassword}
              onClose={() => setShowChangePassword(false)}
              colors={colors}
            />
          </>
        )}
      </ScrollView>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
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
  },
  fieldGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  fieldDivider: {
    height: 1,
    marginLeft: 16,
  },
  fieldContent: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityItemLabel: {
    fontSize: 16,
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
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
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
