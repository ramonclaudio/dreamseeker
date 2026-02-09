import { useState, useCallback } from "react";
import { Alert, ActionSheetIOS } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

const BANNER_ASPECT: [number, number] = [3, 1];

async function pickBannerImage(useCamera: boolean) {
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required.");
      return null;
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library permission is required.");
      return null;
    }
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: BANNER_ASPECT, quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: BANNER_ASPECT, quality: 0.8 });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export function useBannerUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const profile = useQuery(api.community.getMyProfile, {});
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateBanner = useMutation(api.community.updateBanner);
  const removeBannerMut = useMutation(api.community.removeBanner);

  const bannerUrl = profile?.bannerUrl ?? null;

  const uploadBanner = useCallback(
    async (uri: string) => {
      setIsUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uri);
        const blob = await response.blob();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || "image/jpeg" },
          body: blob,
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        const { storageId } = await uploadResponse.json();
        await updateBanner({ storageId });
      } catch (error) {
        Alert.alert(
          "Upload Failed",
          error instanceof Error ? error.message : "Unable to upload banner. Please try again.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, updateBanner],
  );

  const removeBanner = useCallback(async () => {
    setIsUploading(true);
    try {
      await removeBannerMut();
    } catch (error) {
      Alert.alert(
        "Removal Failed",
        error instanceof Error ? error.message : "Unable to remove banner. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }, [removeBannerMut]);

  const handlePickImage = useCallback(
    async (useCamera: boolean) => {
      const uri = await pickBannerImage(useCamera);
      if (uri) await uploadBanner(uri);
    },
    [uploadBanner],
  );

  const showOptions = useCallback(() => {
    const hasBanner = !!bannerUrl;
    const options = hasBanner
      ? ["Choose from Library", "Take Photo", "Remove Banner", "Cancel"]
      : ["Choose from Library", "Take Photo", "Cancel"];
    const destructiveButtonIndex = hasBanner ? 2 : undefined;
    const cancelButtonIndex = hasBanner ? 3 : 2;

    if (process.env.EXPO_OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex },
        (buttonIndex) => {
          if (buttonIndex === 0) handlePickImage(false);
          else if (buttonIndex === 1) handlePickImage(true);
          else if (buttonIndex === 2 && hasBanner) removeBanner();
        },
      );
    } else {
      Alert.alert("Profile Banner", "Choose an option", [
        { text: "Choose from Library", onPress: () => handlePickImage(false) },
        { text: "Take Photo", onPress: () => handlePickImage(true) },
        ...(hasBanner
          ? [{ text: "Remove Banner", style: "destructive" as const, onPress: removeBanner }]
          : []),
        { text: "Cancel", style: "cancel" as const },
      ]);
    }
  }, [bannerUrl, handlePickImage, removeBanner]);

  return { isUploading, bannerUrl, showOptions };
}
