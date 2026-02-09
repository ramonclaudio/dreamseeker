import { View, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

import { IconSymbol } from "@/components/ui/icon-symbol";
import type { ColorPalette } from "@/constants/theme";
import { IconSize, Spacing } from "@/constants/layout";
import { Opacity, Duration } from "@/constants/ui";

const BANNER_VISIBLE_HEIGHT = 160;

export function BannerSection({
  bannerUrl,
  isUploading,
  onPress,
  colors,
  topInset = 0,
}: {
  bannerUrl: string | null;
  isUploading: boolean;
  onPress: () => void;
  colors: ColorPalette;
  topInset?: number;
}) {
  const totalHeight = BANNER_VISIBLE_HEIGHT + topInset;

  return (
    <Pressable
      onPress={onPress}
      disabled={isUploading}
      style={({ pressed }) => ({
        opacity: pressed ? Opacity.pressed : 1,
        height: totalHeight,
        backgroundColor: colors.primary,
      })}
      accessibilityRole="button"
      accessibilityLabel="Change profile banner"
    >
      {bannerUrl ? (
        <Image
          source={{ uri: bannerUrl }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={Duration.normal}
        />
      ) : null}

      {/* Edit badge — top left, inside safe area */}
      <View
        style={{
          position: "absolute",
          top: topInset + Spacing.xs,
          left: Spacing.lg,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.35)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <IconSymbol name={bannerUrl ? "pencil" : "camera.fill"} size={IconSize.xl} color="#fff" />
        )}
      </View>
    </Pressable>
  );
}
