import { useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useMutation } from 'convex/react';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { api } from '@/convex/_generated/api';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type ProfileSetupModalProps = {
  visible: boolean;
  onComplete: () => void;
};

export function ProfileSetupModal({ visible, onComplete }: ProfileSetupModalProps) {
  const colors = useColors();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateProfile = useMutation(api.community.getOrCreateProfile);
  const updateProfile = useMutation(api.community.updateProfile);

  const handleSubmit = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Display name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await getOrCreateProfile({});
      await updateProfile({
        displayName: trimmed,
        bio: bio.trim() || undefined,
        isPublic,
      });
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View style={styles.header}>
          <IconSymbol name="person.crop.circle" size={IconSize['4xl']} color={colors.primary} />
          <ThemedText style={styles.title}>Set Up Your Profile</ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            Let your friends know who you are.
          </ThemedText>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive }]}>
              <ThemedText style={styles.errorText} color={colors.destructive}>{error}</ThemedText>
            </View>
          )}

          <View style={styles.field}>
            <ThemedText style={styles.label}>Display Name</ThemedText>
            <TextInput
              value={displayName}
              onChangeText={(t) => { setDisplayName(t); setError(null); }}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              maxLength={50}
              autoFocus
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>Bio</ThemedText>
              <ThemedText style={styles.charCount} color={colors.mutedForeground}>{bio.length}/200</ThemedText>
            </View>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.bioInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              maxLength={200}
              multiline
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Public Profile</ThemedText>
              <ThemedText style={styles.toggleHint} color={colors.mutedForeground}>
                Let others find and add you as a friend.
              </ThemedText>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.muted, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? Opacity.pressed : isLoading ? 0.6 : 1 },
            ]}
          >
            <ThemedText style={styles.buttonText} color={colors.primaryForeground}>
              {isLoading ? 'Setting up...' : 'Get Started'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: FontSize.sm,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: FontSize.xl,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  toggleHint: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xxs,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
});
