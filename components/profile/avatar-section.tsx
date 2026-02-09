import { View, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Image } from "expo-image";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Breakpoint, Spacing, TouchTarget, IconSize } from "@/constants/layout";
import { Opacity, Size, Duration, Responsive } from "@/constants/ui";

function useAvatarSize() {
  const { width } = useWindowDimensions();
  if (width >= Breakpoint.desktop) return Responsive.avatar.desktop;
  if (width >= Breakpoint.tablet) return Responsive.avatar.tablet;
  return Responsive.avatar.phone;
}

export function AvatarSection({
  image,
  avatarInitial,
  isUploading,
  onPress,
  colors,
}: {
  image: string | null | undefined;
  avatarInitial: string;
  isUploading: boolean;
  onPress: () => void;
  colors: ColorPalette;
}) {
  const avatarSize = useAvatarSize();
  const borderWidth = 4;

  return (
    <View style={{ paddingHorizontal: Spacing.xl, marginTop: -(avatarSize / 2) }}>
      <Pressable
        onPress={onPress}
        disabled={isUploading}
        style={({ pressed }) => ({
          opacity: pressed ? Opacity.pressed : 1,
          minHeight: TouchTarget.min,
          alignSelf: "flex-start",
        })}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        accessibilityState={{ disabled: isUploading }}
      >
        <View style={{ position: "relative" }}>
          {/* White ring around avatar */}
          <View
            style={{
              width: avatarSize + borderWidth * 2,
              height: avatarSize + borderWidth * 2,
              borderRadius: (avatarSize + borderWidth * 2) / 2,
              backgroundColor: colors.background,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                }}
                contentFit="cover"
                transition={Duration.normal}
              />
            ) : (
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: colors.card,
                  borderWidth: 2,
                  borderColor: colors.borderAccent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: avatarSize * 0.36,
                    lineHeight: avatarSize * 0.36,
                    fontWeight: "700",
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                  color={colors.primary}
                >
                  {avatarInitial}
                </ThemedText>
              </View>
            )}
          </View>
          {isUploading ? (
            <View
              style={{
                position: "absolute",
                top: borderWidth,
                left: borderWidth,
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: colors.overlay,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={colors.primaryForeground} size="large" />
            </View>
          ) : (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: Size.badge,
                height: Size.badge,
                borderRadius: Size.badge / 2,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                backgroundColor: colors.primary,
                borderColor: colors.background,
              }}
            >
              <IconSymbol
                name={image ? "pencil" : "camera.fill"}
                size={IconSize.sm}
                color={colors.primaryForeground}
              />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
