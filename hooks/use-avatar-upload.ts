import { useCallback } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { pickImage } from "@/lib/image-picker";
import { useImageUpload } from "@/hooks/use-image-upload";

type User = {
  image?: string | null;
  imageStorageId?: string | null;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
};

export function useAvatarUpload(user: User | undefined | null) {
  const deleteFile = useMutation(api.storage.deleteFile);

  const oldImageStorageId = user?.imageStorageId ?? null;

  const onUploaded = useCallback(
    async (storageId: string) => {
      const { error } = await authClient.updateUser({ image: storageId });
      if (error) throw new Error(error.message ?? "Failed to update profile image");
      if (oldImageStorageId) {
        try {
          await deleteFile({ storageId: oldImageStorageId as Id<"_storage"> });
        } catch {}
      }
    },
    [oldImageStorageId, deleteFile],
  );

  const onRemoved = useCallback(async () => {
    const { error } = await authClient.updateUser({ image: "" });
    if (error) throw new Error(error.message ?? "Failed to remove profile image");
    if (oldImageStorageId) {
      try {
        await deleteFile({ storageId: oldImageStorageId as Id<"_storage"> });
      } catch {}
    }
  }, [oldImageStorageId, deleteFile]);

  const { isUploading, showOptions } = useImageUpload({
    label: "Photo",
    pick: pickImage,
    onUploaded,
    onRemoved,
    hasImage: !!user?.image,
  });

  const avatarInitial =
    (user?.displayName ?? user?.name)?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return { isUploading, showOptions, avatarInitial };
}
