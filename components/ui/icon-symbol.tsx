import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  checklist: 'checklist',
  checkmark: 'check',
  'checkmark.circle.fill': 'check-circle',
  xmark: 'close',
  gear: 'settings',
  'gearshape.fill': 'settings',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  'person.fill': 'person',
  'person.crop.circle': 'account-circle',
  'lock.fill': 'lock',
  'rectangle.portrait.and.arrow.right': 'logout',
  'trash.fill': 'delete',
  pencil: 'edit',
  'camera.fill': 'photo-camera',
  'photo.fill': 'photo',
  'xmark.circle.fill': 'cancel',
  'star.fill': 'star',
  sparkles: 'auto-awesome',
  gift: 'card-giftcard',
} as const;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
