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
  'clock.arrow.circlepath': 'history',
  'paintpalette.fill': 'palette',
  'square.and.arrow.up': 'ios-share',
  'bell.fill': 'notifications',
  'hand.raised.fill': 'pan-tool',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'hammer.fill': 'build',
  link: 'link',
  'doc.text.fill': 'description',
  'doc.plaintext.fill': 'article',
  'arrow.up.right': 'open-in-new',
  'envelope.fill': 'mail',
  'exclamationmark.bubble.fill': 'report-problem',
  'creditcard.fill': 'credit-card',
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
