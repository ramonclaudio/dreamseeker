import { useState, useEffect } from "react";
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useQuery, useMutation } from "convex/react";

import { ThemedText } from "@/components/ui/themed-text";
import { GlassSwitch } from "@/components/ui/glass-switch";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AvatarSection } from "@/components/profile/avatar-section";
import { BannerSection } from "@/components/profile/banner-section";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { useBannerUpload } from "@/hooks/use-banner-upload";
import { haptics } from "@/lib/haptics";
import { api } from "@/convex/_generated/api";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize, TouchTarget, HitSlop } from "@/constants/layout";
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from "@/convex/constants";

const modalHeaderStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  paddingHorizontal: Spacing.xl,
  paddingTop: Spacing.lg,
  paddingBottom: Spacing.lg,
  borderBottomWidth: 0.5,
};

export function EditProfileModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const user = useQuery(api.auth.getCurrentUser);
  const updateProfile = useMutation(api.community.updateProfile);

  const {
    isUploading: isUploadingAvatar,
    showOptions: showAvatarOptions,
    avatarInitial,
  } = useAvatarUpload(user);
  const {
    isUploading: isUploadingBanner,
    bannerUrl,
    showOptions: showBannerOptions,
  } = useBannerUpload();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync fields when modal opens or user data changes
  useEffect(() => {
    if (visible && user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setIsPublic(user.isPublic);
      setError(null);
    }
  }, [visible, user?.displayName, user?.bio, user?.isPublic]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        isPublic,
      });
      haptics.success();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      haptics.error();
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {/* Header */}
        <View style={[modalHeaderStyle, { borderBottomColor: colors.separator }]}>
          <Pressable
            onPress={onClose}
            hitSlop={HitSlop.sm}
            style={{ minHeight: TouchTarget.min, minWidth: TouchTarget.min, justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            Edit Profile
          </ThemedText>
          <Pressable
            onPress={handleDone}
            hitSlop={HitSlop.sm}
            disabled={isSaving}
            style={{ minHeight: TouchTarget.min, minWidth: TouchTarget.min, justifyContent: "center", alignItems: "flex-end" }}
            accessibilityRole="button"
            accessibilityLabel={isSaving ? "Saving" : "Done"}
            accessibilityState={{ disabled: isSaving }}
          >
            <ThemedText style={{ fontWeight: "600", opacity: isSaving ? 0.5 : 1 }}>
              {isSaving ? "Saving..." : "Done"}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {/* Banner */}
          <BannerSection
            bannerUrl={bannerUrl}
            isUploading={isUploadingBanner}
            onPress={showBannerOptions}
            colors={colors}
          />

          {/* Avatar */}
          <AvatarSection
            image={user.image}
            avatarInitial={avatarInitial}
            isUploading={isUploadingAvatar}
            onPress={showAvatarOptions}
            colors={colors}
          />

          <View style={{ padding: Spacing.xl, gap: Spacing.xl }}>
            {error && (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: Radius.md,
                  borderCurve: "continuous",
                  padding: Spacing.md,
                  backgroundColor: `${colors.destructive}15`,
                  borderColor: colors.destructive,
                }}
              >
                <ThemedText style={{ fontSize: FontSize.base, textAlign: "center" }} color={colors.destructive}>
                  {error}
                </ThemedText>
              </View>
            )}

            {/* Display Name */}
            <View style={{ gap: Spacing.sm }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>Display Name</ThemedText>
              <TextInput
                style={{
                  borderRadius: Radius.md,
                  borderCurve: "continuous",
                  padding: Spacing.lg,
                  fontSize: FontSize.xl,
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                placeholder="How others see you"
                placeholderTextColor={colors.mutedForeground}
                value={displayName}
                onChangeText={(text) => { setDisplayName(text); setError(null); }}
                autoCapitalize="words"
                maxLength={MAX_DISPLAY_NAME_LENGTH}
                accessibilityLabel="Display Name"
              />
              <ThemedText style={{ fontSize: FontSize.sm, textAlign: "right" }} color={colors.mutedForeground}>
                {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
              </ThemedText>
            </View>

            {/* Bio */}
            <View style={{ gap: Spacing.sm }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>Bio</ThemedText>
              <TextInput
                style={{
                  borderRadius: Radius.md,
                  borderCurve: "continuous",
                  padding: Spacing.lg,
                  fontSize: FontSize.xl,
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Tell others about yourself"
                placeholderTextColor={colors.mutedForeground}
                value={bio}
                onChangeText={(text) => { setBio(text); setError(null); }}
                autoCapitalize="sentences"
                multiline
                maxLength={MAX_BIO_LENGTH}
                accessibilityLabel="Bio"
              />
              <ThemedText style={{ fontSize: FontSize.sm, textAlign: "right" }} color={colors.mutedForeground}>
                {bio.length}/{MAX_BIO_LENGTH}
              </ThemedText>
            </View>

            {/* Public/Private toggle */}
            <View style={{ gap: Spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: Spacing.lg,
                  borderRadius: Radius.lg,
                  borderCurve: "continuous",
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 }}>
                  <IconSymbol name={isPublic ? "globe" : "lock.fill"} size={IconSize["2xl"]} color={colors.mutedForeground} />
                  <View style={{ flex: 1, gap: Spacing.xxs }}>
                    <ThemedText style={{ fontSize: FontSize.xl }}>
                      {isPublic ? "Public Profile" : "Private Profile"}
                    </ThemedText>
                    <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
                      {isPublic ? "Others can find you in search" : "Your profile is hidden from search"}
                    </ThemedText>
                  </View>
                </View>
                <GlassSwitch
                  value={isPublic}
                  onValueChange={(value) => { haptics.light(); setIsPublic(value); }}
                />
              </View>
              <ThemedText style={{ fontSize: FontSize.sm, lineHeight: 18, paddingHorizontal: Spacing.xs }} color={colors.mutedForeground}>
                {isPublic
                  ? "Other dreamers can see your bio, how long you've been a member, and your community pins. That's it \u2014 no stats, no activity details."
                  : "Your profile is completely private. No one can see your bio, activity, or profile page. You can still pin to the community \u2014 your pins will show as \u2018Anonymous Dreamer\u2019 so your identity stays hidden."}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
