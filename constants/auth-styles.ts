import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { Colors, Radius } from './theme';

export function getErrorStyles(colorScheme: 'light' | 'dark'): { container: ViewStyle; text: TextStyle } {
  const colors = Colors[colorScheme];
  return {
    container: {
      backgroundColor: colorScheme === 'light' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(248, 113, 113, 0.15)',
      borderWidth: 1,
      borderColor: colors.destructive,
      borderRadius: Radius.md,
      padding: 12,
      marginBottom: 16,
    },
    text: { color: colors.destructive, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  };
}

export const authStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  successContent: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  hint: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 14, fontWeight: '500' },
  input: { height: 44, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
  button: { height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, lineHeight: 20 },
  linkText: { fontSize: 14, fontWeight: '500' },
});
