import { type TextStyle, type ViewStyle } from 'react-native';

import { Colors, Radius } from './theme';

export function getErrorStyles(colorScheme: 'light' | 'dark'): { container: ViewStyle; text: TextStyle } {
  const colors = Colors[colorScheme];
  return {
    container: {
      backgroundColor: colorScheme === 'light' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(248, 113, 113, 0.15)',
      borderWidth: 1,
      borderColor: colors.destructive,
      borderRadius: Radius.md,
      borderCurve: 'continuous',
      padding: 12,
      marginBottom: 16,
    },
    text: { color: colors.destructive, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  };
}

export const authStyles = {
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' as const, padding: 24 },
  successContent: { flex: 1, justifyContent: 'center' as const, padding: 24, gap: 16 },
  header: { marginBottom: 32, gap: 8 },
  title: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  hint: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  passwordHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  forgotText: { fontSize: 14, fontWeight: '500' as const },
  input: { height: 44, borderRadius: Radius.md, borderCurve: 'continuous' as const, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
  button: { height: 44, borderRadius: Radius.md, borderCurve: 'continuous' as const, alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '500' as const },
  footer: { flexDirection: 'row' as const, justifyContent: 'center' as const, marginTop: 24 },
  footerText: { fontSize: 14, lineHeight: 20 },
  linkText: { fontSize: 14, fontWeight: '500' as const },
  divider: { flexDirection: 'row' as const, alignItems: 'center' as const, marginVertical: 16 },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { marginHorizontal: 16, fontSize: 14 },
};
