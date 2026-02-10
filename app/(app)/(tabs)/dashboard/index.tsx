import { useState } from "react";
import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AvatarSection } from "@/components/profile/avatar-section";
import { BannerSection } from "@/components/profile/banner-section";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ActivityFeed } from "@/components/profile/activity-feed";
import { useColors } from "@/hooks/use-color-scheme";
import { useBannerUpload } from "@/hooks/use-banner-upload";
import { haptics } from "@/lib/haptics";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Radius } from "@/constants/theme";
import {
  Spacing,
  FontSize,
  IconSize,
  MaxWidth,
  TAB_BAR_CLEARANCE,
} from "@/constants/layout";
import { Opacity } from "@/constants/ui";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.auth.getCurrentUser);
  const { bannerUrl } = useBannerUpload();

  const [showEditProfile, setShowEditProfile] = useState(false);

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
  const avatarInitial =
    (user.displayName ?? user.name)?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_CLEARANCE,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
      >
        {/* Banner — display only */}
        <BannerSection
          bannerUrl={bannerUrl}
          isUploading={false}
          onPress={() => {}}
          colors={colors}
          topInset={insets.top}
          editable={false}
        />

        {/* Settings icon — floating over banner */}
        <Pressable
          onPress={() => { haptics.light(); router.push("/(app)/(tabs)/dashboard/settings"); }}
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

        {/* Avatar — display only */}
        <AvatarSection
          image={user.image}
          avatarInitial={avatarInitial}
          isUploading={false}
          onPress={() => {}}
          colors={colors}
          editable={false}
        />

        {/* Display name */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.md }}>
          <ThemedText style={{ fontSize: FontSize["5xl"], fontWeight: "700" }} numberOfLines={1}>
            {displayName}
          </ThemedText>
        </View>

        {/* Username */}
        {username ? (
          <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxs }}>
            <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
              {username}
            </ThemedText>
          </View>
        ) : null}

        {/* Bio */}
        {bio ? (
          <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm }}>
            <ThemedText
              style={{ fontSize: FontSize.base, lineHeight: 20 }}
              numberOfLines={3}
            >
              {bio}
            </ThemedText>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, gap: Spacing.sm }}>
          {/* Edit Profile */}
          <Pressable
            onPress={() => { haptics.light(); setShowEditProfile(true); }}
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.xs,
              paddingVertical: Spacing.md,
              borderRadius: Radius.lg,
              borderCurve: "continuous",
              backgroundColor: colors.primary,
            })}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.primaryForeground}>
              Edit Profile
            </ThemedText>
          </Pressable>

          {/* View Public Profile — only shown when profile is public */}
          {user.isPublic && (
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
          )}
        </View>

        {/* Activity Feed */}
        <ActivityFeed colors={colors} />
      </ScrollView>

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        colors={colors}
      />
    </View>
  );
}
