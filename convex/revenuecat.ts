import { RevenueCat } from 'convex-revenuecat';
import { components } from './_generated/api';
import type { QueryCtx, MutationCtx } from './_generated/server';

export const revenuecat = new RevenueCat(components.revenuecat, {
  REVENUECAT_WEBHOOK_AUTH: process.env.REVENUECAT_WEBHOOK_BEARER_TOKEN,
});

// Helper to check entitlement in queries/mutations
export async function hasEntitlement(
  ctx: QueryCtx | MutationCtx,
  args: { appUserId: string; entitlementId: string }
): Promise<boolean> {
  return revenuecat.hasEntitlement(ctx, args);
}
