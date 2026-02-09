/**
 * Pure dream state machine guards and XP calculations.
 *
 * Extracted from dreamLifecycle.ts and dreams.ts mutations so the
 * same logic can be unit-tested without Convex mocking.
 */
import { XP_REWARDS } from './constants';

export type DreamStatus = 'active' | 'completed' | 'archived';

export interface DreamState {
  status: DreamStatus;
  completedAt?: number;
}

export function canComplete(dream: DreamState): { allowed: boolean; error?: string } {
  if (dream.status === 'completed') return { allowed: false, error: 'Dream is already completed' };
  if (dream.status === 'archived') return { allowed: false, error: 'Cannot complete archived dream' };
  return { allowed: true };
}

export function canArchive(dream: DreamState): { allowed: boolean; error?: string } {
  if (dream.status === 'archived') return { allowed: false, error: 'Dream is already archived' };
  return { allowed: true };
}

export function canRestore(dream: DreamState): { allowed: boolean; error?: string } {
  if (dream.status !== 'archived') return { allowed: false, error: 'Dream is not archived' };
  return { allowed: true };
}

export function canReopen(dream: DreamState): { allowed: boolean; error?: string } {
  if (dream.status !== 'completed') return { allowed: false, error: 'Dream is not completed' };
  return { allowed: true };
}

export function getRestoreStatus(dream: DreamState): DreamStatus {
  return dream.completedAt ? 'completed' : 'active';
}

/**
 * Calculate XP to deduct when archiving a dream.
 * Mirrors the logic in helpers.ts deductDreamXp.
 */
export function calculateArchiveXpDeduction(
  completedActionsCount: number,
  dreamStatus: DreamStatus
): number {
  let xp = completedActionsCount * XP_REWARDS.actionComplete;
  if (dreamStatus === 'completed') xp += XP_REWARDS.dreamComplete;
  return xp;
}

/**
 * Calculate XP to restore when unarchiving a dream.
 * Mirrors the logic in helpers.ts restoreDreamXp.
 */
export function calculateRestoreXpGain(
  completedActionsCount: number,
  hasCompletedAt: boolean
): number {
  let xp = completedActionsCount * XP_REWARDS.actionComplete;
  if (hasCompletedAt) xp += XP_REWARDS.dreamComplete;
  return xp;
}
