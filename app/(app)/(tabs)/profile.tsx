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
  Alert,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation } from 'convex/react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

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
        <ThemedText style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</ThemedText>
        <ThemedText style={styles.fieldValue}>{value || 'Not set'}</ThemedText>
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
            <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">{title}</ThemedText>
          <Pressable onPress={handleSave} hitSlop={8} disabled={isLoading}>
            <ThemedText style={{ color: colors.foreground, fontWeight: '600', opacity: isLoading ? 0.5 : 1 }}>
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
            <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
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
            <ThemedText style={styles.inputLabel}>New Password</ThemedText>
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
            <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
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
            <ThemedText style={[styles.buttonText, { color: colors.primaryForeground }]}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.hint, { color: colors.mutedForeground }]}>
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
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const deleteFile = useMutation(api.storage.deleteFile);

  const [showEditName, setShowEditName] = useState(false);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  const pickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (result.canceled || !result.assets[0]) return;

    await uploadAvatar(result.assets[0].uri);
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploadingAvatar(true);
    const oldImageStorageId = user?.imageStorageId ?? null;
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadResponse = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': blob.type || 'image/jpeg' }, body: blob });
      if (!uploadResponse.ok) throw new Error('Failed to upload image');
      const { storageId } = await uploadResponse.json();
      const { error } = await authClient.updateUser({ image: storageId });
      if (error) throw new Error(error.message ?? 'Failed to update profile image');
      if (oldImageStorageId) {
        try { await deleteFile({ storageId: oldImageStorageId as Id<'_storage'> }); } catch {}
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploadingAvatar(true);
    const oldImageStorageId = user?.imageStorageId ?? null;
    try {
      const { error } = await authClient.updateUser({ image: '' });
      if (error) throw new Error(error.message ?? 'Failed to remove profile image');
      if (oldImageStorageId) {
        try { await deleteFile({ storageId: oldImageStorageId as Id<'_storage'> }); } catch {}
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const showAvatarOptions = () => {
    const options = user?.image
      ? ['Choose from Library', 'Take Photo', 'Remove Photo', 'Cancel']
      : ['Choose from Library', 'Take Photo', 'Cancel'];
    const destructiveButtonIndex = user?.image ? 2 : undefined;
    const cancelButtonIndex = user?.image ? 3 : 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) pickImage(false);
          else if (buttonIndex === 1) pickImage(true);
          else if (buttonIndex === 2 && user?.image) removeAvatar();
        }
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Choose from Library', onPress: () => pickImage(false) },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        ...(user?.image ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: removeAvatar }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
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
                      <ThemedText style={[styles.avatarText, { color: colors.primaryForeground }]}>{avatarInitial}</ThemedText>
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
              <ThemedText style={[styles.avatarHint, { color: colors.mutedForeground }]}>
                Tap to change photo
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account Info</ThemedText>
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
              <ThemedText style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Security</ThemedText>
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
                    <ThemedText style={styles.securityItemLabel}>Change Password</ThemedText>
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
  errorContainer: { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderWidth: 1, borderColor: '#dc2626', borderRadius: Radius.md, padding: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  successContainer: { backgroundColor: 'rgba(22, 163, 74, 0.1)', borderWidth: 1, borderColor: '#16a34a', borderRadius: Radius.md, padding: 12, marginBottom: 16 },
  successText: { color: '#16a34a', fontSize: 14, textAlign: 'center' },
  button: { borderRadius: Radius.md, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
