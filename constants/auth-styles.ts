import { StyleSheet } from 'react-native';

import { Radius } from './theme';

/**
 * Shared styles for auth screens (sign-in, sign-up, forgot-password, reset-password)
 * Following shadcn/ui design patterns
 */
export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)', // v4 destructive with alpha
    borderWidth: 1,
    borderColor: '#dc2626', // v4 destructive
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626', // v4 destructive
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // shadcn-style input: h-9 (36px) or h-10 (40px), rounded-md, border
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc2626', // v4 destructive
  },
  // shadcn-style button: h-9 (36px) or h-10 (40px), rounded-md
  button: {
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
