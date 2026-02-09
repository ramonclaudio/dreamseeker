/**
 * Dream state machine tests.
 *
 * Tests the REAL guard functions and XP calculations exported from
 * convex/dreamGuards.ts — the same functions used by dreamLifecycle.ts
 * and dreams.ts mutations.
 *
 * State diagram:
 *   active → completed (dreams.complete)
 *   active → archived (dreamLifecycle.archive)
 *   completed → active (dreamLifecycle.reopen)
 *   completed → archived (dreamLifecycle.archive)
 *   archived → active (dreamLifecycle.restore, when no completedAt)
 *   archived → completed (dreamLifecycle.restore, when completedAt exists)
 */
import {
  canComplete,
  canArchive,
  canRestore,
  canReopen,
  getRestoreStatus,
  calculateArchiveXpDeduction,
  calculateRestoreXpGain,
  type DreamState,
} from '../convex/dreamGuards';
import { XP_REWARDS } from '../convex/constants';

// ── State transition guards ────────────────────────────────────────────────

describe('Dream state machine', () => {
  describe('Complete transition (active → completed)', () => {
    it('allows completing an active dream', () => {
      expect(canComplete({ status: 'active' }).allowed).toBe(true);
    });

    it('rejects completing an already-completed dream', () => {
      const result = canComplete({ status: 'completed', completedAt: Date.now() });
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('already completed');
    });

    it('rejects completing an archived dream', () => {
      const result = canComplete({ status: 'archived' });
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('archived');
    });
  });

  describe('Archive transition (active/completed → archived)', () => {
    it('allows archiving an active dream', () => {
      expect(canArchive({ status: 'active' }).allowed).toBe(true);
    });

    it('allows archiving a completed dream', () => {
      expect(canArchive({ status: 'completed', completedAt: Date.now() }).allowed).toBe(true);
    });

    it('rejects archiving an already-archived dream', () => {
      const result = canArchive({ status: 'archived' });
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('already archived');
    });
  });

  describe('Restore transition (archived → active/completed)', () => {
    it('allows restoring an archived dream', () => {
      expect(canRestore({ status: 'archived' }).allowed).toBe(true);
    });

    it('rejects restoring a non-archived dream', () => {
      expect(canRestore({ status: 'active' }).allowed).toBe(false);
      expect(canRestore({ status: 'completed', completedAt: Date.now() }).allowed).toBe(false);
    });

    it('restores to completed when dream was previously completed', () => {
      expect(getRestoreStatus({ status: 'archived', completedAt: Date.now() })).toBe('completed');
    });

    it('restores to active when dream was not completed', () => {
      expect(getRestoreStatus({ status: 'archived' })).toBe('active');
    });
  });

  describe('Reopen transition (completed → active)', () => {
    it('allows reopening a completed dream', () => {
      expect(canReopen({ status: 'completed', completedAt: Date.now() }).allowed).toBe(true);
    });

    it('rejects reopening an active dream', () => {
      expect(canReopen({ status: 'active' }).allowed).toBe(false);
    });

    it('rejects reopening an archived dream', () => {
      expect(canReopen({ status: 'archived' }).allowed).toBe(false);
    });
  });

  describe('Invalid transitions', () => {
    it('cannot go directly from archived to completed (must restore)', () => {
      const dream: DreamState = { status: 'archived' };
      expect(canComplete(dream).allowed).toBe(false);
    });
  });
});

// ── XP calculations on state transitions ──────────────────────────────────

describe('Dream XP calculations on state transitions', () => {
  describe('Archive XP deduction', () => {
    it('deducts action XP for active dream', () => {
      const xp = calculateArchiveXpDeduction(5, 'active');
      expect(xp).toBe(5 * XP_REWARDS.actionComplete);
    });

    it('deducts action XP + dream XP for completed dream', () => {
      const xp = calculateArchiveXpDeduction(5, 'completed');
      expect(xp).toBe(5 * XP_REWARDS.actionComplete + XP_REWARDS.dreamComplete);
    });

    it('deducts 0 for dream with no completed actions', () => {
      expect(calculateArchiveXpDeduction(0, 'active')).toBe(0);
    });

    it('deducts only dream XP for completed dream with no actions', () => {
      expect(calculateArchiveXpDeduction(0, 'completed')).toBe(XP_REWARDS.dreamComplete);
    });
  });

  describe('Restore XP gain', () => {
    it('restores action XP for non-completed dream', () => {
      const xp = calculateRestoreXpGain(3, false);
      expect(xp).toBe(3 * XP_REWARDS.actionComplete);
    });

    it('restores action XP + dream XP for previously completed dream', () => {
      const xp = calculateRestoreXpGain(3, true);
      expect(xp).toBe(3 * XP_REWARDS.actionComplete + XP_REWARDS.dreamComplete);
    });

    it('restores 0 for dream with no completed actions and no completion', () => {
      expect(calculateRestoreXpGain(0, false)).toBe(0);
    });
  });

  describe('Archive → Restore roundtrip', () => {
    it('XP deduction and restoration are symmetric for active dream', () => {
      const actions = 5;
      const deducted = calculateArchiveXpDeduction(actions, 'active');
      const restored = calculateRestoreXpGain(actions, false);
      expect(deducted).toBe(restored);
    });

    it('XP deduction and restoration are symmetric for completed dream', () => {
      const actions = 5;
      const deducted = calculateArchiveXpDeduction(actions, 'completed');
      const restored = calculateRestoreXpGain(actions, true);
      expect(deducted).toBe(restored);
    });
  });

  describe('Reopen XP deduction', () => {
    it('deducts dreamComplete XP constant', () => {
      expect(XP_REWARDS.dreamComplete).toBe(100);
    });
  });
});
