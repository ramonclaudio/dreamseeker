import { SymbolView, type SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, type StyleProp, type ViewStyle } from "react-native";

import { IconSize } from "@/constants/layout";

// SF Symbol names used across the app
export const SF_SYMBOLS = [
  "house.fill", "house", "paperplane.fill", "chevron.left.forwardslash.chevron.right",
  "chevron.right", "chevron.down", "chevron.up", "checklist", "checkmark", "checkmark.circle.fill", "xmark",
  "gear", "gearshape", "gearshape.fill", "sun.max.fill", "sun.max", "moon.fill",
  "person.fill", "person", "person.crop.circle", "lock.fill", "lock.open.fill",
  "rectangle.portrait.and.arrow.right", "trash.fill", "pencil", "camera.fill",
  "photo.fill", "xmark.circle.fill", "star", "star.fill", "sparkles", "gift",
  "paintpalette.fill", "square.and.arrow.up", "bell.fill", "hand.raised.fill",
  "questionmark.circle.fill", "info.circle.fill", "hammer.fill", "link",
  "doc.text.fill", "doc.plaintext.fill", "arrow.up.right", "envelope.fill",
  "envelope.badge", "exclamationmark.bubble.fill", "exclamationmark.triangle",
  "exclamationmark.triangle.fill", "creditcard.fill", "map.fill", "safari.fill",
  "bag.fill", "mappin.and.ellipse", "star.leadinghalf.filled", "leaf.fill", "leaf",
  "cup.and.saucer.fill", "airplane", "dollarsign.circle.fill", "briefcase.fill",
  "heart.fill", "lightbulb.fill", "lightbulb", "flame.fill", "flame", "trophy.fill",
  "bolt", "bolt.fill", "target", "quote.bubble.fill", "quote.bubble", "plus",
  "plus.circle.fill", "circle.fill", "circle", "list.bullet", "person.2.fill",
  "figure.walk", "book.fill", "book", "square.and.pencil", "timer", "diamond.fill",
  "crown.fill", "arrow.clockwise", "magnifyingglass", "person.badge.plus",
  "eye.fill", "eye.slash.fill", "person.2", "globe", "square.grid.2x2", "pin.fill",
  "cloud.fill", "sun.min.fill", "chevron.left", "medal.fill",
  "bookmark", "bookmark.fill", "flag.fill",
  "clock", "exclamationmark.circle.fill",
  "archivebox", "archivebox.fill",
] as const;

export type IconSymbolName = (typeof SF_SYMBOLS)[number];

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
