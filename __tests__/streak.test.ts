import {
  calculateStreak,
  checkStreakMilestones,
  computeStreakUpdate,
  type StreakProgress,
} from '../convex/streak';
import { STREAK_MILESTONES, STREAK_XP_REWARDS } from '../convex/constants';

// ── calculateStreak ─────────────────────────────────────────────────────────

describe('calculateStreak', () => {
  it('returns same streak if already active today', () => {
    expect(calculateStreak(5, '2025-06-15', '2025-06-15', '2025-06-14')).toBe(5);
  });

  it('returns same streak of 1 if already active today', () => {
    expect(calculateStreak(1, '2025-06-15', '2025-06-15', '2025-06-14')).toBe(1);
  });

  it('increments streak for consecutive day', () => {
    expect(calculateStreak(3, '2025-06-14', '2025-06-15', '2025-06-14')).toBe(4);
  });

  it('increments from 1 to 2 on second consecutive day', () => {
    expect(calculateStreak(1, '2025-06-14', '2025-06-15', '2025-06-14')).toBe(2);
  });

  it('resets to 1 when streak is broken (gap of 2+ days)', () => {
    expect(calculateStreak(10, '2025-06-10', '2025-06-15', '2025-06-14')).toBe(1);
  });

  it('resets to 1 when streak is broken by exactly 2 days', () => {
    expect(calculateStreak(5, '2025-06-13', '2025-06-15', '2025-06-14')).toBe(1);
  });

  it('handles month boundary (May 31 → Jun 1)', () => {
    expect(calculateStreak(7, '2025-05-31', '2025-06-01', '2025-05-31')).toBe(8);
  });

  it('handles year boundary (Dec 31 → Jan 1)', () => {
    expect(calculateStreak(30, '2024-12-31', '2025-01-01', '2024-12-31')).toBe(31);
  });

  it('handles leap year boundary (Feb 28 → Feb 29)', () => {
    expect(calculateStreak(2, '2024-02-28', '2024-02-29', '2024-02-28')).toBe(3);
  });

  it('handles leap year boundary (Feb 29 → Mar 1)', () => {
    expect(calculateStreak(3, '2024-02-29', '2024-03-01', '2024-02-29')).toBe(4);
  });

  it('handles non-leap year Feb 28 → Mar 1', () => {
    expect(calculateStreak(2, '2025-02-28', '2025-03-01', '2025-02-28')).toBe(3);
  });

  it('streak of 0 becomes 1 (fresh start) when active after gap', () => {
    expect(calculateStreak(0, '2025-06-01', '2025-06-15', '2025-06-14')).toBe(1);
  });

  it('streak of 0 becomes 0+1=1 for consecutive day', () => {
    expect(calculateStreak(0, '2025-06-14', '2025-06-15', '2025-06-14')).toBe(1);
  });
});

// ── checkStreakMilestones ────────────────────────────────────────────────────

describe('checkStreakMilestones', () => {
  it('awards day-1 milestone on first activity', () => {
    const results = checkStreakMilestones(1, []);
    expect(results).toHaveLength(1);
    expect(results[0].milestone).toBe(1);
    expect(results[0].xpReward).toBe(STREAK_XP_REWARDS[1]);
  });

  it('awards day-3 milestone at streak 3', () => {
    const results = checkStreakMilestones(3, [1]);
    expect(results).toHaveLength(1);
    expect(results[0].milestone).toBe(3);
    expect(results[0].xpReward).toBe(STREAK_XP_REWARDS[3]);
  });

  it('does not re-award already-earned milestones', () => {
    const results = checkStreakMilestones(3, [1, 3]);
    expect(results).toHaveLength(0);
  });

  it('awards multiple milestones when streak jumps', () => {
    // Jump from 0 to 5 (e.g., restored from backup)
    const results = checkStreakMilestones(5, []);
    expect(results).toHaveLength(3); // 1, 3, 5
    expect(results.map((r) => r.milestone)).toEqual([1, 3, 5]);
  });

  it('awards all milestones for streak of 30 with none earned', () => {
    const results = checkStreakMilestones(30, []);
    expect(results).toHaveLength(STREAK_MILESTONES.length);
    expect(results.map((r) => r.milestone)).toEqual([...STREAK_MILESTONES]);
  });

  it('awards only unerned milestones for partial history', () => {
    const results = checkStreakMilestones(10, [1, 3]); // earned 1,3 but not 5,10
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.milestone)).toEqual([5, 10]);
  });

  it('returns empty when streak is below all milestones', () => {
    // This shouldn't happen (lowest milestone is 1), but test defensive behavior
    const results = checkStreakMilestones(0, []);
    expect(results).toHaveLength(0);
  });

  it('awards nothing for streak 2 (between milestones 1 and 3)', () => {
    const results = checkStreakMilestones(2, [1]);
    expect(results).toHaveLength(0);
  });

  it('handles undefined streakMilestones (empty array fallback)', () => {
    // Production code uses `progress.streakMilestones ?? []`
    const results = checkStreakMilestones(1, []);
    expect(results).toHaveLength(1);
  });

  it('XP rewards escalate with milestone size', () => {
    const results = checkStreakMilestones(30, []);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].xpReward).toBeGreaterThan(results[i - 1].xpReward);
    }
  });
});

// ── computeStreakUpdate ─────────────────────────────────────────────────────

describe('computeStreakUpdate', () => {
  const baseProgress: StreakProgress = {
    currentStreak: 3,
    lastActiveDate: '2025-06-14',
    longestStreak: 5,
    streakMilestones: [1, 3],
  };

  it('increments streak on consecutive day', () => {
    const result = computeStreakUpdate(baseProgress, '2025-06-15', '2025-06-14', false);
    expect(result.newStreak).toBe(4);
    expect(result.patch.currentStreak).toBe(4);
  });

  it('returns same streak if already active today', () => {
    const result = computeStreakUpdate(baseProgress, '2025-06-14', '2025-06-13', false);
    expect(result.newStreak).toBe(3);
    expect(result.patch.currentStreak).toBe(3);
  });

  it('resets streak when broken', () => {
    const result = computeStreakUpdate(baseProgress, '2025-06-20', '2025-06-19', false);
    expect(result.newStreak).toBe(1);
    expect(result.patch.currentStreak).toBe(1);
  });

  it('updates longestStreak when current exceeds it', () => {
    const progress: StreakProgress = {
      ...baseProgress,
      currentStreak: 5,
      longestStreak: 5,
    };
    const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
    expect(result.newStreak).toBe(6);
    expect(result.patch.longestStreak).toBe(6);
  });

  it('does not decrease longestStreak when streak resets', () => {
    const result = computeStreakUpdate(baseProgress, '2025-06-20', '2025-06-19', false);
    expect(result.newStreak).toBe(1);
    expect(result.patch.longestStreak).toBe(5); // preserved from baseProgress
  });

  it('awards milestone XP at streak 5', () => {
    const progress: StreakProgress = {
      currentStreak: 4,
      lastActiveDate: '2025-06-14',
      longestStreak: 4,
      streakMilestones: [1, 3],
    };
    const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
    expect(result.newStreak).toBe(5);
    expect(result.milestoneXp).toBe(STREAK_XP_REWARDS[5]);
    expect(result.streakMilestone).toEqual({ streak: 5, xpReward: STREAK_XP_REWARDS[5] });
    expect(result.patch.streakMilestones).toContain(5);
  });

  it('awards no milestone XP between milestones', () => {
    const progress: StreakProgress = {
      currentStreak: 5,
      lastActiveDate: '2025-06-14',
      longestStreak: 5,
      streakMilestones: [1, 3, 5],
    };
    const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
    expect(result.milestoneXp).toBe(0);
    expect(result.streakMilestone).toBeNull();
  });

  it('preserves existing milestone history in patch', () => {
    const progress: StreakProgress = {
      currentStreak: 4,
      lastActiveDate: '2025-06-14',
      longestStreak: 4,
      streakMilestones: [1, 3],
    };
    const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
    const milestones = result.patch.streakMilestones as number[];
    expect(milestones).toContain(1);
    expect(milestones).toContain(3);
    expect(milestones).toContain(5);
  });

  describe('skipStreak = true', () => {
    it('does not modify streak', () => {
      const result = computeStreakUpdate(baseProgress, '2025-06-15', '2025-06-14', true);
      expect(result.newStreak).toBe(3); // unchanged
    });

    it('does not include streak fields in patch', () => {
      const result = computeStreakUpdate(baseProgress, '2025-06-15', '2025-06-14', true);
      expect(result.patch).toEqual({}); // empty patch
    });

    it('awards no milestone XP', () => {
      const result = computeStreakUpdate(baseProgress, '2025-06-15', '2025-06-14', true);
      expect(result.milestoneXp).toBe(0);
      expect(result.streakMilestone).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles missing streakMilestones (undefined)', () => {
      const progress: StreakProgress = {
        currentStreak: 0,
        lastActiveDate: '2025-06-10',
        longestStreak: 0,
        streakMilestones: undefined,
      };
      const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
      expect(result.newStreak).toBe(1);
      expect(result.milestoneXp).toBe(STREAK_XP_REWARDS[1]);
    });

    it('accumulates XP from multiple milestones at once', () => {
      const progress: StreakProgress = {
        currentStreak: 9,
        lastActiveDate: '2025-06-14',
        longestStreak: 9,
        streakMilestones: [1, 3, 5], // missing 10
      };
      const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
      expect(result.newStreak).toBe(10);
      expect(result.milestoneXp).toBe(STREAK_XP_REWARDS[10]);
    });

    it('handles brand new user (streak 0, first activity)', () => {
      const progress: StreakProgress = {
        currentStreak: 0,
        lastActiveDate: '',
        longestStreak: 0,
        streakMilestones: [],
      };
      const result = computeStreakUpdate(progress, '2025-06-15', '2025-06-14', false);
      expect(result.newStreak).toBe(1);
      expect(result.patch.longestStreak).toBe(1);
    });
  });
});
