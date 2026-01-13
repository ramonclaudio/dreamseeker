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
  ActivityIndicator,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { api } from '@/convex/_generated/api';

function ProfileField({ label, value, onPress, colors }: {
  label: string;
  value: string;
  onPress: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.field,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}>
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.fieldValue, { color: colors.text }]}>{value || 'Not set'}</Text>
      </View>
      <IconSymbol name="pencil" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function EditModal({ visible, onClose, title, label, value: initialValue, onSave, colors, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }: {
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
}) {
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
            <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
          </Pressable>
          <Text style={[Typography.subtitle, { color: colors.text }]}>{title}</Text>
          <Pressable onPress={handleSave} hitSlop={8} disabled={isLoading}>
            <Text style={{ color: colors.foreground, fontWeight: '600', opacity: isLoading ? 0.5 : 1 }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.modalContent}>
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
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
            <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
          </Pressable>
          <Text style={[Typography.subtitle, { color: colors.text }]}>Change Password</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={[styles.successContainer, { backgroundColor: `${colors.success}15`, borderColor: colors.success }]}>
              <Text style={[styles.successText, { color: colors.success }]}>Password changed successfully!</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Current Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
              placeholder="Enter current password"
              placeholderTextColor={colors.mutedForeground}
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
            <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
              placeholder="Enter new password"
              placeholderTextColor={colors.mutedForeground}
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
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.mutedForeground}
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
              { backgroundColor: colors.primary, opacity: isLoading || success ? 0.7 : 1 },
            ]}
            onPress={handleChangePassword}
            disabled={isLoading || success}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </Pressable>

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            For security, you will remain signed in on this device. All other sessions will be signed out.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const user = useQuery(api.auth.getCurrentUser);
  const { isUploading: isUploadingAvatar, showOptions: showAvatarOptions, avatarInitial } = useAvatarUpload(user);

  const [showEditName, setShowEditName] = useState(false);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleUpdateName = async (name: string) => {
    const { error } = await authClient.updateUser({ name });
    if (error) {
      haptics.error();
      throw new Error(error.message ?? 'Failed to update name');
    }
    haptics.success();
  };

  const handleUpdateUsername = async (username: string) => {
    if (username.length < 3) {
      haptics.error();
      throw new Error('Username must be at least 3 characters');
    }
    if (username.length > 20) {
      haptics.error();
      throw new Error('Username must be at most 20 characters');
    }
    const { error } = await authClient.updateUser({ username });
    if (error) {
      haptics.error();
      const message = error.message ?? '';
      if (message.toLowerCase().includes('already taken')) {
        throw new Error('Username is already taken');
      }
      throw new Error(message || 'Failed to update username');
    }
    haptics.success();
  };

  const handleUpdateEmail = async (newEmail: string) => {
    const { error } = await authClient.changeEmail({ newEmail });
    if (error) {
      haptics.error();
      throw new Error(error.message ?? 'Failed to update email');
    }
    haptics.success();
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[Typography.title, { color: colors.text }]}>Profile</Text>
        </View>

        {user && (
          <>
            <View style={styles.avatarSection}>
              <Pressable
                onPress={showAvatarOptions}
                disabled={isUploadingAvatar}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={styles.avatarContainer}>
                  {user.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={styles.avatar}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{avatarInitial}</Text>
                    </View>
                  )}
                  {isUploadingAvatar ? (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator color={colors.primaryForeground} size="large" />
                    </View>
                  ) : (
                    <View style={[styles.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                      <IconSymbol name="camera.fill" size={14} color={colors.primaryForeground} />
                    </View>
                  )}
                </View>
              </Pressable>
              <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>
                Tap to change photo
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account Info</Text>
              <GlassCard style={styles.fieldGroup}>
                <ProfileField
                  label="Name"
                  value={user.name || ''}
                  onPress={() => {
                    haptics.selection();
                    setShowEditName(true);
                  }}
                  colors={colors}
                />
                <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
                <ProfileField
                  label="Username"
                  value={user.username ? `@${user.username}` : ''}
                  onPress={() => {
                    haptics.selection();
                    setShowEditUsername(true);
                  }}
                  colors={colors}
                />
                <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
                <ProfileField
                  label="Email"
                  value={user.email || ''}
                  onPress={() => {
                    haptics.selection();
                    setShowEditEmail(true);
                  }}
                  colors={colors}
                />
              </GlassCard>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Security</Text>
              <GlassCard style={styles.fieldGroup}>
                <Pressable
                  style={({ pressed }) => [
                    styles.securityItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setShowChangePassword(true);
                  }}>
                  <View style={styles.securityItemLeft}>
                    <IconSymbol name="lock.fill" size={22} color={colors.mutedForeground} />
                    <Text style={[styles.securityItemLabel, { color: colors.text }]}>Change Password</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />
                </Pressable>
              </GlassCard>
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
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 36, lineHeight: 36, fontWeight: '600', textAlign: 'center', includeFontPadding: false },
  avatarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 50, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarHint: { fontSize: 13, marginTop: 8 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginLeft: 12 },
  fieldGroup: { borderRadius: 12, overflow: 'hidden' },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  fieldDivider: { height: 1, marginLeft: 16 },
  fieldContent: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
  fieldValue: { fontSize: 16 },
  securityItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12 },
  securityItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  securityItemLabel: { fontSize: 16 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128, 128, 128, 0.2)' },
  modalContent: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { borderRadius: Radius.md, padding: 16, fontSize: 16 },
  errorContainer: { borderWidth: 1, borderRadius: Radius.md, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  successContainer: { borderWidth: 1, borderRadius: Radius.md, padding: 12, marginBottom: 16 },
  successText: { fontSize: 14, textAlign: 'center' },
  button: { borderRadius: Radius.md, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
