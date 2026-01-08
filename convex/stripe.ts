import { query, action } from './_generated/server';
import { components } from './_generated/api';
import { StripeSubscriptions } from '@convex-dev/stripe';
import { v } from 'convex/values';

const stripeClient = new StripeSubscriptions(components.stripe, {});

export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, { userId: identity.subject });
  },
});

export const getPaymentHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.runQuery(components.stripe.public.listPaymentsByUserId, { userId: identity.subject });
  },
});

export const createCheckoutSession = action({
  args: { priceId: v.string(), successUrl: v.string(), cancelUrl: v.string() },
  returns: v.object({ sessionId: v.string(), url: v.union(v.string(), v.null()) }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCheckoutSession(ctx, {
      priceId: args.priceId,
      customerId: customer.customerId,
      mode: 'subscription',
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      subscriptionMetadata: { userId: identity.subject },
    });
  },
});

export const cancelSubscription = action({
  args: { subscriptionId: v.string(), immediately: v.optional(v.boolean()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const subscription = await ctx.runQuery(components.stripe.public.getSubscription, { stripeSubscriptionId: args.subscriptionId });
    if (!subscription || subscription.userId !== identity.subject) throw new Error('Subscription not found or access denied');

    await stripeClient.cancelSubscription(ctx, { stripeSubscriptionId: args.subscriptionId, cancelAtPeriodEnd: !args.immediately });
    return null;
  },
});

export const reactivateSubscription = action({
  args: { subscriptionId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const subscription = await ctx.runQuery(components.stripe.public.getSubscription, { stripeSubscriptionId: args.subscriptionId });
    if (!subscription || subscription.userId !== identity.subject) throw new Error('Subscription not found or access denied');

    await stripeClient.reactivateSubscription(ctx, { stripeSubscriptionId: args.subscriptionId });
    return null;
  },
});

export const getCustomerPortalUrl = action({
  args: { returnUrl: v.string() },
  returns: v.union(v.object({ url: v.string() }), v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const subscriptions = await ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, { userId: identity.subject });
    if (subscriptions.length === 0) return null;

    return await stripeClient.createCustomerPortalSession(ctx, { customerId: subscriptions[0].stripeCustomerId, returnUrl: args.returnUrl });
  },
});
