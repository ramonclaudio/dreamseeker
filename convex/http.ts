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

const supportEmail = env.supportEmail;

const htmlPage = (title: string, content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Expo Starter App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fafafa; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #111; }
    h2 { font-size: 1.25rem; margin: 1.5rem 0 0.5rem; color: #333; }
    p { margin-bottom: 1rem; color: #444; }
    ul { margin: 0 0 1rem 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .updated { font-size: 0.875rem; color: #666; margin-bottom: 1.5rem; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="container">${content}</div>
</body>
</html>`;

const privacyContent = `
<h1>Privacy Policy</h1>
<p class="updated">Last updated: January 2025</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.</p>
<ul>
  <li><strong>Account Information:</strong> Email address, username, and name</li>
  <li><strong>Profile Information:</strong> Profile photo (optional)</li>
  <li><strong>Usage Data:</strong> Tasks you create and interactions with the app</li>
  <li><strong>Device Information:</strong> Device type, operating system, and push notification tokens</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Process transactions and send related information</li>
  <li>Send push notifications (with your permission)</li>
  <li>Respond to your comments and questions</li>
  <li>Protect against fraudulent or unauthorized activity</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information. All data is transmitted using TLS encryption, and sensitive information is stored securely.</p>

<h2>Data Retention</h2>
<p>We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account at any time through the app settings.</p>

<h2>Third-Party Services</h2>
<p>We use the following third-party services:</p>
<ul>
  <li><strong>Stripe:</strong> For payment processing</li>
  <li><strong>Resend:</strong> For email delivery</li>
  <li><strong>Expo:</strong> For push notifications</li>
  <li><strong>Apple:</strong> For Sign in with Apple</li>
</ul>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Access your personal data</li>
  <li>Correct inaccurate data</li>
  <li>Request deletion of your data</li>
  <li>Export your data</li>
</ul>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
`;

const termsContent = `
<h1>Terms of Service</h1>
<p class="updated">Last updated: January 2025</p>

<h2>Acceptance of Terms</h2>
<p>By accessing or using Expo Starter App, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>Account Registration</h2>
<p>To use certain features, you must register for an account. You agree to:</p>
<ul>
  <li>Provide accurate and complete information</li>
  <li>Maintain the security of your password</li>
  <li>Accept responsibility for all activities under your account</li>
  <li>Notify us immediately of any unauthorized use</li>
</ul>

<h2>Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
  <li>Violate any applicable laws or regulations</li>
  <li>Infringe on the rights of others</li>
  <li>Transmit malware or interfere with the service</li>
  <li>Attempt to gain unauthorized access</li>
  <li>Use the service for any illegal purpose</li>
</ul>

<h2>Subscriptions and Payments</h2>
<p>Some features require a paid subscription. By subscribing, you agree to:</p>
<ul>
  <li>Pay all applicable fees</li>
  <li>Provide accurate billing information</li>
  <li>Authorize recurring charges until cancelled</li>
</ul>
<p>Subscriptions renew automatically unless cancelled before the renewal date. Refunds are handled according to applicable app store policies.</p>

<h2>Intellectual Property</h2>
<p>The service and its content are protected by copyright, trademark, and other laws. You may not reproduce, modify, or distribute any content without permission.</p>

<h2>Termination</h2>
<p>We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through the app settings.</p>

<h2>Disclaimer of Warranties</h2>
<p>The service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.</p>

<h2>Changes to Terms</h2>
<p>We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.</p>

<h2>Contact</h2>
<p>For questions about these Terms, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
`;

http.route({
  path: '/privacy',
  method: 'GET',
  handler: httpAction(async () => {
    return new Response(htmlPage('Privacy Policy', privacyContent), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }),
});

http.route({
  path: '/terms',
  method: 'GET',
  handler: httpAction(async () => {
    return new Response(htmlPage('Terms of Service', termsContent), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }),
});

export default http;
