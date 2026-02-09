import { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/themed-text";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassSwitch } from "@/components/ui/glass-switch";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AvatarSection } from "@/components/profile/avatar-section";
import { BannerSection } from "@/components/profile/banner-section";
import { EditModal } from "@/components/profile/edit-modal";
import { useColors } from "@/hooks/use-color-scheme";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { useBannerUpload } from "@/hooks/use-banner-upload";
import { haptics } from "@/lib/haptics";
import { router } from "expo-router";
import { timezone } from "@/lib/timezone";
import { api } from "@/convex/_generated/api";
import { Radius } from "@/constants/theme";
import {
  Spacing,
  FontSize,
  IconSize,
  MaxWidth,
  TAB_BAR_HEIGHT,
} from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from "@/convex/constants";

type EditField = "displayName" | "bio" | null;

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.auth.getCurrentUser);
  const progress = useQuery(api.progress.getProgress, { timezone });
  const friendCount = useQuery(api.friends.getFriendCount, {});
  const pendingCount = useQuery(api.friends.getPendingCount, {});
  const getOrCreateProfile = useMutation(api.community.getOrCreateProfile);
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

  const [editField, setEditField] = useState<EditField>(null);
  const [isPublic, setIsPublic] = useState(false);

  // Ensure community profile exists for displayName/bio editing
  useEffect(() => { if (user) getOrCreateProfile(); }, [user !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync isPublic from server
  useEffect(() => { if (user) setIsPublic(user.isPublic); }, [user?.isPublic]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePublic = async (value: boolean) => {
    haptics.light();
    setIsPublic(value);
    try {
      await updateProfile({ isPublic: value });
    } catch {
      setIsPublic(!value);
      haptics.error();
    }
  };

  const handleUpdateField = async (field: NonNullable<EditField>, value: string) => {
    await updateProfile({ [field]: value });
    haptics.success();
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = user.displayName || user.name || "Your Name";
  const username = user.username ? `@${user.username}` : "";
  const bio = user.bio || "";

  const fieldConfig = {
    displayName: { title: "Edit Display Name", label: "Display Name", value: user.displayName || "", placeholder: "How others see you", autoCapitalize: "words" as const, allowEmpty: true, maxLength: MAX_DISPLAY_NAME_LENGTH },
    bio: { title: "Edit Bio", label: "Bio", value: bio, placeholder: "Tell others about yourself", autoCapitalize: "sentences" as const, allowEmpty: true, multiline: true, maxLength: MAX_BIO_LENGTH },
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
      >
        {/* Banner — extends into safe area */}
        <BannerSection
          bannerUrl={bannerUrl}
          isUploading={isUploadingBanner}
          onPress={showBannerOptions}
          colors={colors}
          topInset={insets.top}
        />

        {/* Settings icon — floating over banner */}
        <Pressable
          onPress={() => { haptics.light(); router.push("/(app)/(tabs)/profile/settings"); }}
          style={({ pressed }) => ({
            position: "absolute",
            top: insets.top + Spacing.xs,
            right: Spacing.lg,
            opacity: pressed ? Opacity.pressed : 1,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          })}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <IconSymbol name="gearshape.fill" size={IconSize.xl} color="#fff" />
        </Pressable>

        {/* Avatar overlapping banner */}
        <AvatarSection
          image={user.image}
          avatarInitial={avatarInitial}
          isUploading={isUploadingAvatar}
          onPress={showAvatarOptions}
          colors={colors}
        />

        {/* Display name — tap to edit */}
        <Pressable
          onPress={() => { haptics.selection(); setEditField("displayName"); }}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.xs,
          })}
          accessibilityRole="button"
          accessibilityLabel="Edit display name"
        >
          <ThemedText style={{ fontSize: FontSize["5xl"], fontWeight: "700", flex: 1 }} numberOfLines={1}>
            {displayName}
          </ThemedText>
          <IconSymbol name="pencil" size={IconSize.md} color={colors.mutedForeground} />
        </Pressable>

        {/* Username */}
        {username ? (
          <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxs }}>
            <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
              {username}
            </ThemedText>
          </View>
        ) : null}

        {/* Bio — tap to edit */}
        <Pressable
          onPress={() => { haptics.selection(); setEditField("bio"); }}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing.sm,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: Spacing.xs,
          })}
          accessibilityRole="button"
          accessibilityLabel="Edit bio"
        >
          <ThemedText
            style={{ fontSize: FontSize.base, lineHeight: 20, flex: 1 }}
            color={bio ? colors.foreground : colors.mutedForeground}
            numberOfLines={3}
          >
            {bio || "Add a bio..."}
          </ThemedText>
          <IconSymbol name="pencil" size={IconSize.md} color={colors.mutedForeground} style={{ marginTop: 2 }} />
        </Pressable>

        {/* Friends & Requests */}
        <View style={{ flexDirection: "row", paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "700" }}>
              {friendCount ?? 0}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              Friends
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "700" }}>
              {pendingCount ?? 0}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              Requests
            </ThemedText>
          </View>
        </View>

        {/* View public profile */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl }}>
          <Pressable
            onPress={() => { haptics.light(); router.push(`/user-profile/${user._id}`); }}
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.xs,
              paddingVertical: Spacing.md,
              borderRadius: Radius.lg,
              borderCurve: "continuous",
              backgroundColor: colors.secondary,
            })}
            accessibilityRole="button"
            accessibilityLabel="View public profile"
          >
            <IconSymbol name="eye.fill" size={IconSize.md} color={colors.mutedForeground} />
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.mutedForeground}>
              View Public Profile
            </ThemedText>
          </Pressable>
        </View>

        {/* Public/Private toggle */}
        <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing["2xl"] }}>
          <MaterialCard style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 }}>
                <IconSymbol name={isPublic ? "globe" : "lock.fill"} size={IconSize["2xl"]} color={colors.mutedForeground} />
                <View style={{ flex: 1, gap: Spacing.xxs }}>
                  <ThemedText style={{ fontSize: FontSize.xl }}>
                    {isPublic ? "Public Profile" : "Private Profile"}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>
                    {isPublic ? "Others can find and add you" : "Only friends can see your profile"}
                  </ThemedText>
                </View>
              </View>
              <GlassSwitch value={isPublic} onValueChange={handleTogglePublic} />
            </View>
          </MaterialCard>
        </View>

        {/* Stats */}
        {progress && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing["2xl"] }}>
            <MaterialCard style={{ borderRadius: Radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
              <View style={{ flexDirection: "row", padding: Spacing.lg }}>
                <View style={{ flex: 1, alignItems: "center", gap: Spacing.xs }}>
                  <ThemedText style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}>{progress.level}</ThemedText>
                  <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>Level</ThemedText>
                </View>
                <View style={{ flex: 1, alignItems: "center", gap: Spacing.xs }}>
                  <ThemedText style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}>{progress.totalXp}</ThemedText>
                  <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>XP</ThemedText>
                </View>
                <View style={{ flex: 1, alignItems: "center", gap: Spacing.xs }}>
                  <ThemedText style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}>{progress.currentStreak}</ThemedText>
                  <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>Streak</ThemedText>
                </View>
                <View style={{ flex: 1, alignItems: "center", gap: Spacing.xs }}>
                  <ThemedText style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}>{progress.dreamsCompleted}</ThemedText>
                  <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>Dreams</ThemedText>
                </View>
              </View>
            </MaterialCard>
          </View>
        )}

        {editField && (() => {
          const config = fieldConfig[editField];
          return (
            <EditModal
              visible
              onClose={() => setEditField(null)}
              title={config.title}
              label={config.label}
              value={config.value}
              onSave={(value) => handleUpdateField(editField, value)}
              colors={colors}
              placeholder={config.placeholder}
              autoCapitalize={config.autoCapitalize}
              allowEmpty={config.allowEmpty}
              multiline={"multiline" in config ? (config.multiline as boolean) : undefined}
              maxLength={config.maxLength}
            />
          );
        })()}
      </ScrollView>
    </View>
  );
}
