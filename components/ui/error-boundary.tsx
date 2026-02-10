import { useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { router, type ErrorBoundaryProps } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, TouchTarget } from '@/constants/layout';
import { Radius } from '@/constants/theme';

/**
 * Shared error boundary UI for route-level error boundaries.
 *
 * Usage in any layout:
 * ```ts
 * export { AppErrorBoundary as ErrorBoundary } from '@/components/ui/error-boundary';
 * ```
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  // Don't use useColors() — the provider might have crashed
  const isDark = useColorScheme() === 'dark';
  const c = {
    background: isDark ? '#1A1614' : '#FFF8F3',
    foreground: isDark ? '#F5EDE6' : '#2D2019',
    muted: isDark ? '#9A8A7A' : '#8A7B6D',
    primary: isDark ? '#E8874F' : '#E07B4F',
    primaryFg: '#fff',
    surface: isDark ? '#2A2522' : '#FFF0E8',
  };

  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing['3xl'],
        gap: Spacing.lg,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: c.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        <IconSymbol
          name="exclamationmark.triangle"
          size={32}
          color={c.primary}
        />
      </View>
      <Text
        style={{
          fontSize: 26,
          lineHeight: 32,
          fontWeight: '700',
          textAlign: 'center',
          color: c.foreground,
          letterSpacing: -0.5,
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          textAlign: 'center',
          color: c.muted,
          marginBottom: Spacing.md,
        }}
      >
        Don&apos;t worry — let&apos;s get you back on track.
      </Text>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: c.primary,
          paddingHorizontal: Spacing['3xl'],
          paddingVertical: Spacing.lg,
          minHeight: TouchTarget.min,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: Radius.full,
          borderCurve: 'continuous',
          shadowColor: c.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 6,
          opacity: pressed ? 0.85 : 1,
        })}
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: c.primaryFg,
            letterSpacing: 0.3,
          }}
        >
          Try Again
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/(app)/(tabs)/today')}
        accessibilityRole="button"
        accessibilityLabel="Go home"
        style={({ pressed }) => ({
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: c.muted,
          }}
        >
          Go Home
        </Text>
      </Pressable>
    </View>
  );
}
