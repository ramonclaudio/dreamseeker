import { authQuery } from './functions';

export const getUserBadges = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];
    const userId = ctx.user;

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

export const getBadgeProgress = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];
    const userId = ctx.user;

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
