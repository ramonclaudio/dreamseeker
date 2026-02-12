export type TabBadges = {
  dreams: string | null;
  today: string | null;
  boards: string | null;
  progress: string | null;
};

/**
 * Hook to manage tab badge counts.
 * Returns badge values for each tab - null means no badge, empty string means dot badge.
 *
 * Usage:
 * - `null` = no badge
 * - `""` = dot badge (no text)
 * - `"3"` = badge with count
 * - `"9+"` = badge with overflow
 */
export function useTabBadges(): TabBadges {
  return {
    dreams: null,
    today: null,
    boards: null,
    progress: null,
  };
}
