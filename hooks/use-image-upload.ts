import { useState, useCallback } from "react";
import { Alert, ActionSheetIOS } from "react-native";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

type PickResult = { uri: string; canceled: false } | { canceled: true };

type ImageUploadConfig = {
  /** Label used in action sheet title and error messages (e.g. "Photo", "Banner") */
  label: string;
  /** Pick an image. Receives `useCamera` flag. Return uri or canceled. */
  pick: (useCamera: boolean) => Promise<PickResult>;
  /** Called after successful upload with the storageId */
  onUploaded: (storageId: string) => Promise<void>;
  /** Called when user requests removal. Omit to hide the remove option. */
  onRemoved?: () => Promise<void>;
  /** Whether the current image exists (controls showing "Remove" option) */
  hasImage: boolean;
};

export function useImageUpload(config: ImageUploadConfig) {
  const { label, pick, onUploaded, onRemoved, hasImage } = config;
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const upload = useCallback(
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
        await onUploaded(storageId);
      } catch (error) {
        Alert.alert(
          "Upload Failed",
          error instanceof Error ? error.message : `Unable to upload ${label.toLowerCase()}. Please try again.`,
        );
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, onUploaded, label],
  );

  const remove = useCallback(async () => {
    if (!onRemoved) return;
    setIsUploading(true);
    try {
      await onRemoved();
    } catch (error) {
      Alert.alert(
        "Removal Failed",
        error instanceof Error ? error.message : `Unable to remove ${label.toLowerCase()}. Please try again.`,
      );
    } finally {
      setIsUploading(false);
    }
  }, [onRemoved, label]);

  const handlePickImage = useCallback(
    async (useCamera: boolean) => {
      const result = await pick(useCamera);
      if (!result.canceled) await upload(result.uri);
    },
    [upload, pick],
  );

  const showOptions = useCallback(() => {
    const removeLabel = `Remove ${label}`;
    const options = hasImage
      ? ["Choose from Library", "Take Photo", removeLabel, "Cancel"]
      : ["Choose from Library", "Take Photo", "Cancel"];
    const destructiveButtonIndex = hasImage ? 2 : undefined;
    const cancelButtonIndex = hasImage ? 3 : 2;

    ActionSheetIOS.showActionSheetWithOptions(
      { options, destructiveButtonIndex, cancelButtonIndex },
      (buttonIndex) => {
        if (buttonIndex === 0) handlePickImage(false);
        else if (buttonIndex === 1) handlePickImage(true);
        else if (buttonIndex === 2 && hasImage) remove();
      },
    );
  }, [hasImage, handlePickImage, remove, label]);

  return { isUploading, showOptions };
}
