import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f6ef" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#191d19" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
