import { Tabs, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useTabBadges } from "@/hooks/use-tab-badges";
import { haptics } from "@/lib/haptics";
import { Spacing, FontSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";

export const unstable_settings = { initialRouteName: "today" };

type TabConfig = {
  label: string;
  icon: IconSymbolName;
  selectedIcon: IconSymbolName;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  today: { label: "Today", icon: "house", selectedIcon: "house.fill" },
  "(dreams)": { label: "Dreams", icon: "cloud", selectedIcon: "cloud.fill" },
  boards: { label: "Boards", icon: "square.grid.2x2", selectedIcon: "square.grid.2x2" },
  progress: { label: "Progress", icon: "flame", selectedIcon: "flame.fill" },
};

const TAB_ORDER = ["today", "(dreams)", "boards", "progress"];

type CreateMenuOption = {
  icon: IconSymbolName;
  label: string;
  route: string;
};

const CREATE_MENU_OPTIONS: CreateMenuOption[] = [
  { icon: "sparkles", label: "Dream", route: "/(app)/create-dream" },
  { icon: "checkmark.circle.fill", label: "Action", route: "/(app)/create-action" },
  { icon: "timer", label: "Focus", route: "/(app)/focus-timer" },
  { icon: "book.fill", label: "Journal", route: "/(app)/journal-entry" },
  { icon: "pin.fill", label: "Pin", route: "/(app)/(tabs)/boards?create=true" },
];

function TabItem({
  route,
  index,
  state,
  descriptors,
  navigation,
  colors,
  badge,
}: {
  route: BottomTabBarProps["state"]["routes"][number];
  index: number;
  state: BottomTabBarProps["state"];
  descriptors: BottomTabBarProps["descriptors"];
  navigation: BottomTabBarProps["navigation"];
  colors: ReturnType<typeof useColors>;
  badge: string | null;
}) {
  const config = TAB_CONFIG[route.name]!;
  const { options } = descriptors[route.key];
  const isFocused = state.index === index;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      haptics.selection();
      navigation.navigate(route.name, route.params);
    }
  };

  const onLongPress = () => {
    navigation.emit({ type: "tabLongPress", target: route.key });
  };

  const iconColor = isFocused ? colors.foreground : colors.mutedForeground;

  return (
    <Pressable
      key={route.key}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      style={({ pressed }) => [
        styles.tab,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.iconContainer}>
        <IconSymbol
          name={isFocused ? config.selectedIcon : config.icon}
          size={22}
          color={iconColor}
          weight={isFocused ? "semibold" : "regular"}
        />
        {badge !== null && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.destructive,
                minWidth: badge ? 16 : 8,
                height: badge ? 16 : 8,
                borderRadius: badge ? 8 : 4,
              },
            ]}
          >
            {badge ? (
              <ThemedText
                style={styles.badgeText}
                color={colors.onColor}
              >
                {badge}
              </ThemedText>
            ) : null}
          </View>
        )}
      </View>
      <ThemedText
        style={[
          styles.label,
          { fontWeight: isFocused ? "600" : "400" },
        ]}
        color={iconColor}
      >
        {config.label}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const badges = useTabBadges();
  const router = useRouter();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { height: windowHeight } = useWindowDimensions();

  const badgeMap: Record<string, string | null> = {
    today: badges.today,
    "(dreams)": badges.dreams,
    boards: badges.boards,
    progress: badges.progress,
  };

  // Filter visible routes and split into left/right halves around the create button
  const visibleRoutes = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => TAB_CONFIG[route.name]);

  const leftTabs = visibleRoutes.slice(0, 2);
  const rightTabs = visibleRoutes.slice(2);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom - 8, 4) },
      ]}
    >
      {showCreateMenu && (
        <Pressable
          style={[styles.dismissOverlay, { height: windowHeight }]}
          onPress={() => setShowCreateMenu(false)}
        />
      )}
      {showCreateMenu && (
        <View style={[styles.createMenu, { backgroundColor: colors.card, borderColor: colors.separator, shadowColor: colors.shadow }]}>
          {CREATE_MENU_OPTIONS.map((option) => (
            <Pressable
              key={option.route}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={`Opens ${option.label.toLowerCase()} screen`}
              style={({ pressed }) => [
                styles.createMenuOption,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                haptics.light();
                setShowCreateMenu(false);
                router.push(option.route as Href);
              }}
            >
              <IconSymbol name={option.icon} size={20} color={colors.foreground} />
              <ThemedText style={styles.createMenuLabel} color={colors.foreground}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.card,
            borderColor: colors.separator,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {leftTabs.map(({ route, index }) => (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            state={state}
            descriptors={descriptors}
            navigation={navigation}
            colors={colors}
            badge={badgeMap[route.name] ?? null}
          />
        ))}
        <Pressable
          onPress={() => {
            haptics.light();
            setShowCreateMenu((prev) => !prev);
          }}
          accessibilityRole="button"
          accessibilityLabel="Create menu"
          accessibilityHint="Opens menu to create dream or focus session"
          accessibilityState={{ expanded: showCreateMenu }}
          style={({ pressed }) => [
            styles.createButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol name="plus" size={24} color={colors.primaryForeground} weight="semibold" />
        </Pressable>
        {rightTabs.map(({ route, index }) => (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            state={state}
            descriptors={descriptors}
            navigation={navigation}
            colors={colors}
            badge={badgeMap[route.name] ?? null}
          />
        ))}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_ORDER.map((name) => (
        <Tabs.Screen key={name} name={name} />
      ))}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  iconContainer: {
    position: "relative",
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 14,
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: 14,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -14,
  },
  dismissOverlay: {
    position: "absolute",
    bottom: 0,
    left: -Spacing.lg,
    right: -Spacing.lg,
  },
  createMenu: {
    alignSelf: "center",
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  createMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  createMenuLabel: {
    fontSize: FontSize.lg,
    fontWeight: "500",
  },
});
