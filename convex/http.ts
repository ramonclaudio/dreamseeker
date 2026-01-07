import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { components } from './_generated/api';
import { registerRoutes as registerStripeRoutes } from '@convex-dev/stripe';
import { authComponent, createAuth } from './auth';
import { resend } from './email';

const http = httpRouter();

// Register Better Auth routes with CORS for web support
authComponent.registerRoutes(http, createAuth, { cors: true });

// Stripe webhook for payment events (auto-syncs to Convex tables)
registerStripeRoutes(http, components.stripe);

// Resend webhook for email delivery status
http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;
