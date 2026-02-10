import { useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useImageUpload } from "@/hooks/use-image-upload";

const BANNER_ASPECT: [number, number] = [3, 1];

async function pickBannerImage(useCamera: boolean): Promise<{ uri: string; canceled: false } | { canceled: true }> {
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required.");
      return { canceled: true };
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library permission is required.");
      return { canceled: true };
    }
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: BANNER_ASPECT, quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: BANNER_ASPECT, quality: 0.8 });

  if (result.canceled || !result.assets[0]) return { canceled: true };
  return { uri: result.assets[0].uri, canceled: false };
}

export function useBannerUpload() {
  const profile = useQuery(api.community.getMyProfile, {});
  const updateBanner = useMutation(api.community.updateBanner);
  const removeBannerMut = useMutation(api.community.removeBanner);

  const bannerUrl = profile?.bannerUrl ?? null;

  const onUploaded = useCallback(
    async (storageId: string) => {
      await updateBanner({ storageId: storageId as Id<"_storage"> });
    },
    [updateBanner],
  );

  const onRemoved = useCallback(async () => {
    await removeBannerMut();
  }, [removeBannerMut]);

  const { isUploading, showOptions } = useImageUpload({
    label: "Banner",
    pick: pickBannerImage,
    onUploaded,
    onRemoved,
    hasImage: !!bannerUrl,
  });

  return { isUploading, bannerUrl, showOptions };
}
