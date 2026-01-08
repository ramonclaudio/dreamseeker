import { StripeProvider as Stripe } from '@stripe/stripe-react-native';
import { type ReactElement } from 'react';

const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function StripeProvider({ children }: { children: ReactElement }) {
  if (!key) return children;
  return (
    <Stripe publishableKey={key} merchantIdentifier="merchant.com.ramonclaudio.expo-starter-app" urlScheme="expostarterapp">
      {children}
    </Stripe>
  );
}
