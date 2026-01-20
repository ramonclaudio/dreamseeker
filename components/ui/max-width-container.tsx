import { View, type ViewProps, type ViewStyle } from 'react-native';

import { MaxWidth } from '@/constants/layout';

type MaxWidthContainerProps = ViewProps & {
  maxWidth?: keyof typeof MaxWidth | number;
  center?: boolean;
};

export function MaxWidthContainer({
  children,
  maxWidth = 'content',
  center = true,
  style,
  ...props
}: MaxWidthContainerProps) {
  const maxWidthValue = typeof maxWidth === 'number' ? maxWidth : MaxWidth[maxWidth];

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxWidthValue,
    ...(center && { alignSelf: 'center' }),
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}
