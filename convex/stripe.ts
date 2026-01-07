import { query, action } from './_generated/server';
import { components } from './_generated/api';
import { StripeSubscriptions } from '@convex-dev/stripe';
import { v } from 'convex/values';

// Initialize the Stripe client for server-side operations
const stripeClient = new StripeSubscriptions(components.stripe, {});

// ============================================================================
// QUERIES (real-time reactive via Convex)
// ============================================================================

/**
 * Get the user's active or trialing subscription
 * Returns null if no active subscription
 */
export const getActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );

    // Find active or trialing subscription
    return (
      subscriptions.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      ) ?? null
    );
  },
});

/**
 * Get all subscriptions for the current user (including past)
 */
export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );
  },
});

/**
 * Get payment history for the current user
 */
export const getPaymentHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.runQuery(
      components.stripe.public.listPaymentsByUserId,
      { userId: identity.subject }
    );
  },
});

// ============================================================================
// ACTIONS (Stripe API calls)
// ============================================================================

/**
 * Create a checkout session for a subscription
 * Returns the checkout URL to redirect the user to
 */
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Get or create Stripe customer (idempotent)
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    // Create checkout session with user linking metadata
    return await stripeClient.createCheckoutSession(ctx, {
      priceId: args.priceId,
      customerId: customer.customerId,
      mode: 'subscription',
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      subscriptionMetadata: {
        userId: identity.subject,
      },
    });
  },
});

/**
 * Cancel a subscription
 * By default cancels at period end (user keeps access until then)
 */
export const cancelSubscription = action({
  args: {
    subscriptionId: v.string(),
    immediately: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify ownership
    const subscription = await ctx.runQuery(
      components.stripe.public.getSubscription,
      { stripeSubscriptionId: args.subscriptionId }
    );

    if (!subscription || subscription.userId !== identity.subject) {
      throw new Error('Subscription not found or access denied');
    }

    await stripeClient.cancelSubscription(ctx, {
      stripeSubscriptionId: args.subscriptionId,
      cancelAtPeriodEnd: !args.immediately,
    });

    return null;
  },
});

/**
 * Reactivate a subscription that was set to cancel at period end
 */
export const reactivateSubscription = action({
  args: {
    subscriptionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify ownership
    const subscription = await ctx.runQuery(
      components.stripe.public.getSubscription,
      { stripeSubscriptionId: args.subscriptionId }
    );

    if (!subscription || subscription.userId !== identity.subject) {
      throw new Error('Subscription not found or access denied');
    }

    await stripeClient.reactivateSubscription(ctx, {
      stripeSubscriptionId: args.subscriptionId,
    });

    return null;
  },
});

/**
 * Get customer portal URL for managing billing
 */
export const getCustomerPortalUrl = action({
  args: {
    returnUrl: v.string(),
  },
  returns: v.union(
    v.object({ url: v.string() }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Find customer from subscriptions
    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );

    if (subscriptions.length === 0) {
      return null;
    }

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: subscriptions[0].stripeCustomerId,
      returnUrl: args.returnUrl,
    });
  },
});
