import { useState, useEffect } from "react";
import { View, Pressable, TextInput, Modal, KeyboardAvoidingView } from "react-native";

import type { Doc } from "@/convex/_generated/dataModel";
import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, HitSlop } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

type Action = Doc<"actions">;

export function EditActionModal({
  visible,
  action,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  action: Action | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
  colors: ColorPalette;
}) {
  const [text, setText] = useState(action?.text ?? "");
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when modal opens with new action
  useEffect(() => {
    if (visible && action) {
      setText(action.text);
    }
  }, [visible, action]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      await onSave(text.trim());
      onClose();
    } catch {
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.lg,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
          }}
        >
          <Pressable onPress={onClose} hitSlop={HitSlop.sm}>
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle">Edit Action</ThemedText>
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !text.trim()}
            hitSlop={HitSlop.sm}
          >
            <ThemedText
              style={{ fontWeight: "600", opacity: isLoading || !text.trim() ? 0.5 : 1 }}
            >
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>
        <View style={{ padding: Spacing.xl }}>
          <TextInput
            style={{
              backgroundColor: colors.secondary,
              borderRadius: Radius.md,
              padding: Spacing.lg,
              fontSize: FontSize.xl,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder="Action step..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
