import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

import { TouchTarget } from '@/constants/layout';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      style={[{ minHeight: TouchTarget.min, justifyContent: 'center' }, rest.style]}
      accessibilityRole="link"
      accessibilityHint="Opens in browser"
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          event.preventDefault();
          await openBrowserAsync(href, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
        }
      }}
    />
  );
}
