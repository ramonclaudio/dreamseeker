import { StripeProvider as Stripe } from '@stripe/stripe-react-native';
import { type ReactElement } from 'react';

import { env } from '@/lib/env';

export function StripeProvider({ children }: { children: ReactElement }) {
  return (
    <Stripe publishableKey={env.stripePublishableKey} merchantIdentifier="merchant.com.ramonclaudio.expo-starter-app" urlScheme="expostarterapp">
      {children}
    </Stripe>
  );
}
