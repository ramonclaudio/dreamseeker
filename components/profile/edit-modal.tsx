import { useState } from "react";
import {
  View,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, TouchTarget, FontSize, HitSlop } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import type { ColorPalette } from "@/constants/theme";

const inputGroupStyle = { gap: Spacing.sm };
const inputStyle = {
  borderRadius: Radius.md,
  borderCurve: "continuous" as const,
  padding: Spacing.lg,
  fontSize: FontSize.xl,
};
const errorContainerStyle = {
  borderWidth: 1,
  borderRadius: Radius.md,
  borderCurve: "continuous" as const,
  padding: Spacing.md,
};
const modalHeaderBaseStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  paddingHorizontal: Spacing.xl,
  paddingBottom: Spacing.lg,
  borderBottomWidth: 0.5,
};

export function EditModal({
  visible,
  onClose,
  title,
  label,
  value: initialValue,
  onSave,
  colors,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  colors: ColorPalette;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setValue(initialValue);
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!value.trim()) {
      setError(`${label} cannot be empty`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSave(value.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={[
            modalHeaderBaseStyle,
            { paddingTop: Spacing.lg, borderBottomColor: colors.separator },
          ]}
        >
          <Pressable
            onPress={handleClose}
            hitSlop={HitSlop.sm}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            {title}
          </ThemedText>
          <Pressable
            onPress={handleSave}
            hitSlop={HitSlop.sm}
            disabled={isLoading}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Saving" : "Save"}
            accessibilityState={{ disabled: isLoading }}
          >
            <ThemedText style={{ fontWeight: "600", opacity: isLoading ? 0.5 : 1 }}>
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ flex: 1, padding: Spacing.xl, gap: Spacing.xl }}>
          {error && (
            <View
              style={[
                errorContainerStyle,
                { backgroundColor: `${colors.destructive}15`, borderColor: colors.destructive },
              ]}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.destructive}
              >
                {error}
              </ThemedText>
            </View>
          )}

          <View style={inputGroupStyle}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>{label}</ThemedText>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError(null);
              }}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoFocus
              accessibilityLabel={label}
              accessibilityHint={`Enter your ${label.toLowerCase()}`}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
