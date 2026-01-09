import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { components } from './_generated/api';
import { registerRoutes as registerStripeRoutes } from '@convex-dev/stripe';
import { authComponent, createAuth } from './auth';
import { resend } from './email';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });
registerStripeRoutes(http, components.stripe);

http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction((ctx, req) => resend.handleResendEventWebhook(ctx, req)),
});

export default http;
