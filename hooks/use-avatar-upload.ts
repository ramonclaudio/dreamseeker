import { useState, useCallback, useEffect, useRef } from "react";
import { Alert, ActionSheetIOS } from "react-native";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { pickImage, createImageInput, triggerImageInput } from "@/lib/image-picker";

type User = {
  image?: string | null;
  imageStorageId?: string | null;
  name?: string | null;
  email?: string | null;
};

export function useAvatarUpload(user: User | undefined | null) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const deleteFile = useMutation(api.storage.deleteFile);
  const fileInputRef = useRef<ReturnType<typeof createImageInput>>(null);

  useEffect(() => {
    if (process.env.EXPO_OS === "web" && typeof document !== "undefined") {
      fileInputRef.current = createImageInput(() => {});
      return () => {
        if (fileInputRef.current && document.body.contains(fileInputRef.current)) {
          document.body.removeChild(fileInputRef.current);
        }
      };
    }
  }, []);

  const uploadAvatar = useCallback(
    async (uri: string) => {
      setIsUploading(true);
      const oldImageStorageId = user?.imageStorageId ?? null;
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
        const { error } = await authClient.updateUser({ image: storageId });
        if (error) throw new Error(error.message ?? "Failed to update profile image");

        if (oldImageStorageId) {
          try {
            await deleteFile({ storageId: oldImageStorageId as Id<"_storage"> });
          } catch {}
        }
      } catch (error) {
        Alert.alert(
          "Upload Failed",
          error instanceof Error ? error.message : "Unable to upload image. Please try again.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [user?.imageStorageId, generateUploadUrl, deleteFile],
  );

  const removeAvatar = useCallback(async () => {
    setIsUploading(true);
    const oldImageStorageId = user?.imageStorageId ?? null;
    try {
      const { error } = await authClient.updateUser({ image: "" });
      if (error) throw new Error(error.message ?? "Failed to remove profile image");
      if (oldImageStorageId) {
        try {
          await deleteFile({ storageId: oldImageStorageId as Id<"_storage"> });
        } catch {}
      }
    } catch (error) {
      Alert.alert(
        "Removal Failed",
        error instanceof Error ? error.message : "Unable to remove image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }, [user?.imageStorageId, deleteFile]);

  const handlePickImage = useCallback(
    async (useCamera: boolean) => {
      if (process.env.EXPO_OS === "web") {
        triggerImageInput(fileInputRef.current, useCamera, uploadAvatar);
      } else {
        const result = await pickImage(useCamera);
        if (!result.canceled) await uploadAvatar(result.uri);
      }
    },
    [uploadAvatar],
  );

  const showOptions = useCallback(() => {
    const hasImage = !!user?.image;
    const options = hasImage
      ? ["Choose from Library", "Take Photo", "Remove Photo", "Cancel"]
      : ["Choose from Library", "Take Photo", "Cancel"];
    const destructiveButtonIndex = hasImage ? 2 : undefined;
    const cancelButtonIndex = hasImage ? 3 : 2;

    if (process.env.EXPO_OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex },
        (buttonIndex) => {
          if (buttonIndex === 0) handlePickImage(false);
          else if (buttonIndex === 1) handlePickImage(true);
          else if (buttonIndex === 2 && hasImage) removeAvatar();
        },
      );
    } else if (process.env.EXPO_OS === "web") {
      handlePickImage(false);
    } else {
      Alert.alert("Profile Photo", "Choose an option", [
        { text: "Choose from Library", onPress: () => handlePickImage(false) },
        { text: "Take Photo", onPress: () => handlePickImage(true) },
        ...(hasImage
          ? [{ text: "Remove Photo", style: "destructive" as const, onPress: removeAvatar }]
          : []),
        { text: "Cancel", style: "cancel" as const },
      ]);
    }
  }, [user?.image, handlePickImage, removeAvatar]);

  const avatarInitial =
    user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return { isUploading, showOptions, avatarInitial };
}
