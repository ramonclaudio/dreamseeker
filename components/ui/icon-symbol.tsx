import { SymbolView, type SymbolWeight } from "expo-symbols";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { OpaqueColorValue, type StyleProp, type ViewStyle, type TextStyle } from "react-native";

import { IconSize } from "@/constants/layout";

// SF Symbol names (iOS) -> Material Community Icons (Android/Web)
const ANDROID_MAPPING = {
  "house.fill": "home",
  house: "home-outline",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code-tags",
  "chevron.right": "chevron-right",
  checklist: "format-list-checks",
  checkmark: "check",
  "checkmark.circle.fill": "check-circle",
  xmark: "close",
  gear: "cog",
  "gearshape.fill": "cog",
  "sun.max.fill": "white-balance-sunny",
  "sun.max": "white-balance-sunny",
  "moon.fill": "moon-waning-crescent",
  "person.fill": "account",
  person: "account-outline",
  "person.crop.circle": "account-circle",
  "lock.fill": "lock",
  "rectangle.portrait.and.arrow.right": "logout",
  "trash.fill": "delete",
  pencil: "pencil",
  "camera.fill": "camera",
  "photo.fill": "image",
  "xmark.circle.fill": "close-circle",
  "star.fill": "star",
  sparkles: "auto-fix",
  gift: "gift",
  "clock.arrow.circlepath": "history",
  "paintpalette.fill": "palette",
  "square.and.arrow.up": "share-variant",
  "bell.fill": "bell",
  "hand.raised.fill": "hand-back-right",
  "questionmark.circle.fill": "help-circle",
  "info.circle.fill": "information",
  "hammer.fill": "hammer",
  link: "link",
  "doc.text.fill": "file-document",
  "doc.plaintext.fill": "file-document-outline",
  "arrow.up.right": "open-in-new",
  "envelope.fill": "email",
  "envelope.badge": "email-alert",
  "exclamationmark.bubble.fill": "alert-circle",
  "creditcard.fill": "credit-card",
  "map.fill": "map-marker",
  "safari.fill": "compass",
  "bag.fill": "shopping",
  "mappin.and.ellipse": "map-marker",
  "star.leadinghalf.filled": "star-half-full",
  "leaf.fill": "leaf",
  leaf: "leaf",
  "cup.and.saucer.fill": "coffee",
  // Dream category icons
  "airplane": "airplane",
  "dollarsign.circle.fill": "cash",
  "briefcase.fill": "briefcase",
  "heart.fill": "heart",
  // Tab icons
  "lightbulb.fill": "lightbulb",
  lightbulb: "lightbulb-outline",
  // Gamification icons
  "flame.fill": "fire",
  flame: "fire",
  "trophy.fill": "trophy",
  bolt: "lightning-bolt",
  "bolt.fill": "lightning-bolt",
  "target": "target",
  "quote.bubble.fill": "format-quote-close",
  "quote.bubble": "format-quote-close",
  plus: "plus",
  "plus.circle.fill": "plus-circle",
  "circle.fill": "circle",
  circle: "circle-outline",
} as const;

export type IconSymbolName = keyof typeof ANDROID_MAPPING;

type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
};

export function IconSymbol({
  name,
  size = IconSize["3xl"],
  color,
  style,
  weight = "regular",
}: IconSymbolProps) {
  // Use native SF Symbols on iOS for best native feel
  if (process.env.EXPO_OS === "ios") {
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color as string}
        style={style}
        weight={weight}
        resizeMode="scaleAspectFit"
      />
    );
  }

  // Fallback to Material Community Icons on Android/Web
  return (
    <MaterialCommunityIcons
      color={color as string}
      size={size}
      name={ANDROID_MAPPING[name]}
      style={style as StyleProp<TextStyle>}
    />
  );
}
