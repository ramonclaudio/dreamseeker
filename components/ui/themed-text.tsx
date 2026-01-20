import { useState, useEffect } from 'react';
import { Text, type TextProps, type TextStyle, Platform, AccessibilityInfo } from 'react-native';

import { Typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-color-scheme';

type FontWeight = TextStyle['fontWeight'];

type ThemedTextProps = TextProps & {
  variant?: keyof typeof Typography;
  color?: string;
};

// Map font weights to their bold equivalents (HIG Bold Text setting)
const BOLD_WEIGHT_MAP: Record<string, FontWeight> = {
  '100': '400',
  '200': '500',
  '300': '600',
  '400': '700',
  '500': '800',
  '600': '900',
  '700': '900',
  '800': '900',
  '900': '900',
  normal: '700',
  bold: '900',
};

function useBoldText(): boolean {
  const [boldText, setBoldText] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    AccessibilityInfo.isBoldTextEnabled().then(setBoldText);
    const subscription = AccessibilityInfo.addEventListener('boldTextChanged', setBoldText);
    return () => subscription.remove();
  }, []);

  return boldText;
}

export function ThemedText({ style, variant = 'default', color, ...props }: ThemedTextProps) {
  const colors = useColors();
  const boldText = useBoldText();

  const variantStyle = Typography[variant] as TextStyle;
  const baseWeight = variantStyle.fontWeight ?? '400';
  const adjustedWeight = boldText ? BOLD_WEIGHT_MAP[String(baseWeight)] ?? '700' : baseWeight;

  return (
    <Text
      allowFontScaling={true}
      maxFontSizeMultiplier={2}
      style={[
        variantStyle,
        { color: color ?? colors.text, fontWeight: adjustedWeight },
        style,
      ]}
      {...props}
    />
  );
}
