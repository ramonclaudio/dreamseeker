import { useState } from 'react';
import {
  Pressable,
  ScrollView,
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

const sectionStyle = { marginTop: 24, paddingHorizontal: 20 };
const fieldDividerStyle = { height: 1, marginLeft: 16 };
const inputGroupStyle = { marginBottom: 20 };
const inputStyle = { borderRadius: Radius.md, borderCurve: 'continuous' as const, padding: 16, fontSize: 16 };
const buttonStyle = { borderRadius: Radius.md, borderCurve: 'continuous' as const, padding: 16, alignItems: 'center' as const, marginTop: 8 };
const errorContainerStyle = { borderWidth: 1, borderRadius: Radius.md, borderCurve: 'continuous' as const, padding: 12, marginBottom: 16 };
const modalHeaderStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(128, 128, 128, 0.2)' };

function ProfileField({ label, value, onPress, colors }: {
  label: string;
  value: string;
  onPress: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', textTransform: 'uppercase', color: colors.mutedForeground }}>{label}</Text>
        <Text style={{ fontSize: 16, color: colors.text }}>{value || 'Not set'}</Text>
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
        style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={modalHeaderStyle}>
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

        <View style={{ flex: 1, padding: 20 }}>
          {error && (
            <View style={[errorContainerStyle, { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive }]}>
              <Text style={{ fontSize: 14, textAlign: 'center', color: colors.destructive }}>{error}</Text>
            </View>
          )}

          <View style={inputGroupStyle}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.text }}>{label}</Text>
            <TextInput
              style={[inputStyle, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
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
        style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={modalHeaderStyle}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
          </Pressable>
          <Text style={[Typography.subtitle, { color: colors.text }]}>Change Password</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
          {error && (
            <View style={[errorContainerStyle, { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive }]}>
              <Text style={{ fontSize: 14, textAlign: 'center', color: colors.destructive }}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={[errorContainerStyle, { backgroundColor: `${colors.success}15`, borderColor: colors.success }]}>
              <Text style={{ fontSize: 14, textAlign: 'center', color: colors.success }}>Password changed successfully!</Text>
            </View>
          )}

          <View style={inputGroupStyle}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.text }}>Current Password</Text>
            <TextInput
              style={[inputStyle, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
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

          <View style={inputGroupStyle}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.text }}>New Password</Text>
            <TextInput
              style={[inputStyle, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
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

          <View style={inputGroupStyle}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.text }}>Confirm New Password</Text>
            <TextInput
              style={[inputStyle, { backgroundColor: colors.secondary, color: colors.foreground, borderWidth: 1, borderColor: colors.border }]}
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
            style={[buttonStyle, { backgroundColor: colors.primary, opacity: isLoading || success ? 0.7 : 1 }]}
            onPress={handleChangePassword}
            disabled={isLoading || success}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryForeground }}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </Pressable>

          <Text style={{ fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 18, color: colors.mutedForeground }}>
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
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.background }}>
          <Text style={[Typography.title, { color: colors.text }]}>Profile</Text>
        </View>

        {user && (
          <>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Pressable
                onPress={showAvatarOptions}
                disabled={isUploadingAvatar}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={{ position: 'relative' }}>
                  {user.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.primary }}>
                      <Text style={{ fontSize: 36, lineHeight: 36, fontWeight: '600', textAlign: 'center', includeFontPadding: false, color: colors.primaryForeground }}>{avatarInitial}</Text>
                    </View>
                  )}
                  {isUploadingAvatar ? (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 50, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator color={colors.primaryForeground} size="large" />
                    </View>
                  ) : (
                    <View style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, backgroundColor: colors.primary, borderColor: colors.background }}>
                      <IconSymbol name="camera.fill" size={14} color={colors.primaryForeground} />
                    </View>
                  )}
                </View>
              </Pressable>
              <Text style={{ fontSize: 13, marginTop: 8, color: colors.mutedForeground }}>
                Tap to change photo
              </Text>
            </View>

            <View style={sectionStyle}>
              <Text style={{ fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginLeft: 12, color: colors.mutedForeground }}>Account Info</Text>
              <GlassCard style={{ borderRadius: 12, borderCurve: 'continuous', overflow: 'hidden' }}>
                <ProfileField
                  label="Name"
                  value={user.name || ''}
                  onPress={() => {
                    haptics.selection();
                    setShowEditName(true);
                  }}
                  colors={colors}
                />
                <View style={[fieldDividerStyle, { backgroundColor: colors.border }]} />
                <ProfileField
                  label="Username"
                  value={user.username ? `@${user.username}` : ''}
                  onPress={() => {
                    haptics.selection();
                    setShowEditUsername(true);
                  }}
                  colors={colors}
                />
                <View style={[fieldDividerStyle, { backgroundColor: colors.border }]} />
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

            <View style={sectionStyle}>
              <Text style={{ fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginLeft: 12, color: colors.mutedForeground }}>Security</Text>
              <GlassCard style={{ borderRadius: 12, borderCurve: 'continuous', overflow: 'hidden' }}>
                <Pressable
                  style={({ pressed }) => [
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderCurve: 'continuous' },
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setShowChangePassword(true);
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <IconSymbol name="lock.fill" size={22} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 16, color: colors.text }}>Change Password</Text>
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
