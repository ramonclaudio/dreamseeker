import { View, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

import { IconSymbol } from "@/components/ui/icon-symbol";
import type { ColorPalette } from "@/constants/theme";
import { IconSize } from "@/constants/layout";
import { Opacity, Duration } from "@/constants/ui";

const BANNER_VISIBLE_HEIGHT = 160;

export function BannerSection({
  bannerUrl,
  isUploading,
  onPress,
  colors,
  topInset = 0,
  editable = true,
}: {
  bannerUrl: string | null;
  isUploading: boolean;
  onPress: () => void;
  colors: ColorPalette;
  topInset?: number;
  editable?: boolean;
}) {
  const totalHeight = BANNER_VISIBLE_HEIGHT + topInset;

  return (
    <Pressable
      onPress={editable ? onPress : undefined}
      disabled={!editable || isUploading}
      style={({ pressed }) => ({
        opacity: editable && pressed ? Opacity.pressed : 1,
        height: totalHeight,
        backgroundColor: colors.primary,
      })}
      accessibilityRole={editable ? "button" : undefined}
      accessibilityLabel={editable ? "Change profile banner" : "Profile banner"}
    >
      {bannerUrl ? (
        <Image
          source={{ uri: bannerUrl }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={Duration.normal}
        />
      ) : null}

      {editable && (
        <View
          style={{
            position: "absolute",
            top: topInset,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <IconSymbol name="camera.fill" size={IconSize.xl} color="#fff" />
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
