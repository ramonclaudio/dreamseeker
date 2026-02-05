import { memo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { Link, router } from "expo-router";

import { api } from "@/convex/_generated/api";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassControl } from "@/components/ui/glass-control";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useSubscription } from "@/hooks/use-subscription";
import { Radius, type ColorPalette } from "@/constants/theme";
import {
  Spacing,
  TouchTarget,
  FontSize,
  MaxWidth,
  IconSize,
  HitSlop,
} from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  type DreamCategory,
} from "@/constants/dreams";

const CATEGORY_ICONS: Record<DreamCategory, any> = {
  travel: "airplane",
  money: "creditcard.fill",
  career: "briefcase.fill",
  lifestyle: "house.fill",
  growth: "leaf.fill",
  relationships: "heart.fill",
};

const CategoryCard = memo(function CategoryCard({
  category,
  count,
  colors,
}: {
  category: DreamCategory;
  count: number;
  colors: ColorPalette;
}) {
  const config = DREAM_CATEGORIES[category];

  return (
    <Link href={`/(app)/(tabs)/(home)/${category}`} asChild>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          minWidth: "45%",
          opacity: pressed ? Opacity.pressed : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel={`${config.label} dreams, ${count} dreams`}
      >
        <MaterialCard
          style={{
            padding: Spacing.lg,
            alignItems: "center",
            gap: Spacing.sm,
            borderLeftWidth: 4,
            borderLeftColor: config.color,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${config.color}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol
              name={CATEGORY_ICONS[category]}
              size={IconSize["3xl"]}
              color={config.color}
            />
          </View>
          <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }}>
            {config.label}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            {count} {count === 1 ? "dream" : "dreams"}
          </ThemedText>
        </MaterialCard>
      </Pressable>
    </Link>
  );
});

function CreateDreamModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DreamCategory>("growth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDream = useMutation(api.dreams.create);
  const { canCreateDream, showUpgrade } = useSubscription();

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Please enter a dream title");
      return;
    }

    if (!canCreateDream) {
      haptics.warning();
      onClose();
      showUpgrade();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dreamId = await createDream({ title: title.trim(), category });
      haptics.success();
      onClose();
      setTitle("");
      setCategory("growth");
      router.push(`/(app)/dream/${dreamId}`);
    } catch (e) {
      if (e instanceof Error && e.message === "LIMIT_REACHED") {
        haptics.warning();
        onClose();
        showUpgrade();
      } else {
        setError(e instanceof Error ? e.message : "Failed to create dream");
        haptics.error();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setCategory("growth");
    setError(null);
    onClose();
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
        {/* Header */}
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
          <Pressable
            onPress={handleClose}
            hitSlop={HitSlop.sm}
            style={{ minWidth: TouchTarget.min, minHeight: TouchTarget.min, justifyContent: "center" }}
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle">New Dream</ThemedText>
          <Pressable
            onPress={handleCreate}
            disabled={isLoading || !title.trim()}
            hitSlop={HitSlop.sm}
            style={{
              minWidth: TouchTarget.min,
              minHeight: TouchTarget.min,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <ThemedText
              style={{
                fontWeight: "600",
                opacity: isLoading || !title.trim() ? 0.5 : 1,
              }}
            >
              {isLoading ? "Creating..." : "Create"}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View
              style={{
                backgroundColor: `${colors.destructive}15`,
                borderWidth: 1,
                borderColor: colors.destructive,
                borderRadius: Radius.md,
                padding: Spacing.md,
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.destructive}
              >
                {error}
              </ThemedText>
            </View>
          )}

          {/* Title Input */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              What&apos;s your dream?
            </ThemedText>
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
              placeholder="e.g., Visit Japan, Start a business..."
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError(null);
              }}
              autoFocus
              returnKeyType="next"
            />
          </View>

          {/* Category Selection */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Category
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: Spacing.sm,
              }}
            >
              {DREAM_CATEGORY_LIST.map((cat) => {
                const config = DREAM_CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      haptics.selection();
                      setCategory(cat);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Spacing.xs,
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.sm,
                      borderRadius: Radius.full,
                      backgroundColor: isSelected ? config.color : colors.secondary,
                      borderWidth: 1,
                      borderColor: isSelected ? config.color : colors.border,
                    }}
                  >
                    <IconSymbol
                      name={CATEGORY_ICONS[cat]}
                      size={IconSize.lg}
                      color={isSelected ? "#fff" : config.color}
                    />
                    <ThemedText
                      style={{ fontSize: FontSize.base, fontWeight: "500" }}
                      color={isSelected ? "#fff" : colors.foreground}
                    >
                      {config.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function DreamsScreen() {
  const colors = useColors();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const user = useQuery(api.auth.getCurrentUser);
  const categoryCounts = useQuery(
    api.dreams.getCategoryCounts,
    isAuthenticated ? {} : "skip"
  );
  const progress = useQuery(api.progress.getProgress);
  const { canCreateDream, dreamsRemaining, showUpgrade } = useSubscription();

  const handleCreatePress = () => {
    if (!canCreateDream) {
      haptics.warning();
      showUpgrade();
      return;
    }
    haptics.medium();
    setShowCreateModal(true);
  };

  if (authLoading || categoryCounts === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalDreams = (Object.values(categoryCounts) as number[]).reduce((a, b) => a + b, 0);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: Spacing["4xl"],
          paddingHorizontal: Spacing.xl,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <View style={{ paddingVertical: Spacing.xl }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <ThemedText variant="title">
                {user?.name ? `Hi, ${user.name.split(" ")[0]}!` : "Your Dreams"}
              </ThemedText>
              <ThemedText color={colors.mutedForeground}>
                {totalDreams === 0
                  ? "Start by creating your first dream"
                  : `${totalDreams} ${totalDreams === 1 ? "dream" : "dreams"} in progress`}
              </ThemedText>
            </View>
            {progress && progress.level > 1 && (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: colors.secondary,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.lg,
                }}
              >
                <ThemedText style={{ fontSize: FontSize["2xl"], fontWeight: "700" }}>
                  {progress.level}
                </ThemedText>
                <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                  {progress.levelTitle}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Category Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: Spacing.md,
            marginBottom: Spacing.xl,
          }}
        >
          {DREAM_CATEGORY_LIST.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              count={categoryCounts[category]}
              colors={colors}
            />
          ))}
        </View>

        {/* Create Dream Button */}
        <Pressable
          onPress={handleCreatePress}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
          })}
        >
          <GlassControl
            isInteractive
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.sm,
              padding: Spacing.lg,
              borderRadius: Radius.lg,
            }}
          >
            <IconSymbol name="plus.circle.fill" size={IconSize["2xl"]} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }}>
              Create New Dream
            </ThemedText>
          </GlassControl>
        </Pressable>

        {/* Free tier indicator */}
        {dreamsRemaining !== null && dreamsRemaining > 0 && (
          <ThemedText
            style={{
              fontSize: FontSize.sm,
              textAlign: "center",
              marginTop: Spacing.md,
            }}
            color={colors.mutedForeground}
          >
            {dreamsRemaining} free {dreamsRemaining === 1 ? "dream" : "dreams"} remaining
          </ThemedText>
        )}
      </ScrollView>

      <CreateDreamModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        colors={colors}
      />
    </>
  );
}
