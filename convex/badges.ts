import { query } from './_generated/server';
import { getAuthUserId } from './helpers';

export const getUserBadges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userBadges = await ctx.db
      .query('userBadges')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const allDefinitions = await ctx.db.query('badgeDefinitions').collect();
    const defsByKey = new Map(allDefinitions.map((d) => [d.key, d]));

    return userBadges
      .map((ub) => {
        const def = defsByKey.get(ub.badgeKey);
        return def ? { ...ub, ...def } : null;
      })
      .filter(Boolean);
  },
});

export const getBadgeProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allDefinitions = await ctx.db.query('badgeDefinitions').collect();
    const userBadges = await ctx.db
      .query('userBadges')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const earnedKeys = new Set(userBadges.map((ub) => ub.badgeKey));

    return allDefinitions.map((def) => ({
      ...def,
      earned: earnedKeys.has(def.key),
      earnedAt: userBadges.find((ub) => ub.badgeKey === def.key)?.earnedAt,
    }));
  },
});
