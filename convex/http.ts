import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { components, internal } from './_generated/api';
import { registerRoutes as registerStripeRoutes } from '@convex-dev/stripe';
import { StripeSubscriptions } from '@convex-dev/stripe';
import { authComponent, createAuth } from './auth';
import { resend } from './email';
import { env } from './env';
import type Stripe from 'stripe';

const http = httpRouter();
const stripeClient = new StripeSubscriptions(components.stripe, {});

authComponent.registerRoutes(http, createAuth, { cors: true });

registerStripeRoutes(http, components.stripe, {
  events: {
    'invoice.payment_failed': async (ctx, event: Stripe.InvoicePaymentFailedEvent) => {
      const invoice = event.data.object;
      const customerEmail = invoice.customer_email;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      if (!customerEmail || !customerId) {
        console.error('[Stripe] Payment failed but no customer email found:', invoice.id);
        return;
      }

      console.log('[Stripe] Payment failed for customer:', customerId, 'email:', customerEmail);

      try {
        const portalSession = await stripeClient.createCustomerPortalSession(ctx, {
          customerId,
          returnUrl: env.siteUrl,
        });

        if (portalSession?.url) {
          await ctx.runAction(internal.email.sendPaymentFailedEmailInternal, {
            to: customerEmail,
            portalUrl: portalSession.url,
          });
          console.log('[Stripe] Payment failed email sent to:', customerEmail);
        }
      } catch (error) {
        console.error('[Stripe] Failed to send payment failed email:', error);
      }
    },
  },
  onEvent: async (_ctx, event: Stripe.Event) => {
    console.log('[Stripe] Webhook event:', event.type);
  },
});

http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction((ctx, req) => resend.handleResendEventWebhook(ctx, req)),
});

export default http;
