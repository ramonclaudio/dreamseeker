import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { getLevelFromXp } from "@/constants/dreams";
import { timezone } from "@/lib/timezone";

type LevelUpState = {
  showModal: boolean;
  level: number;
  levelTitle: string;
};

/**
 * Hook that monitors user progress and detects level-up events.
 * Returns state and dismiss handler for the level-up modal.
 */
export function useLevelUp() {
  const progress = useQuery(api.progress.getProgress, { timezone });
  const previousLevelRef = useRef<number | null>(null);
  const [levelUpState, setLevelUpState] = useState<LevelUpState>({
    showModal: false,
    level: 0,
    levelTitle: "",
  });

  useEffect(() => {
    if (!progress) return;

    const currentLevel = getLevelFromXp(progress.totalXp);

    // Initialize previous level on first load
    if (previousLevelRef.current === null) {
      previousLevelRef.current = currentLevel.level;
      return;
    }

    // Detect level up
    if (currentLevel.level > previousLevelRef.current) {
      setLevelUpState({
        showModal: true,
        level: currentLevel.level,
        levelTitle: currentLevel.title,
      });
      previousLevelRef.current = currentLevel.level;
    }
  }, [progress]);

  const dismissModal = () => {
    setLevelUpState((prev) => ({ ...prev, showModal: false }));
  };

  return {
    showLevelUpModal: levelUpState.showModal,
    level: levelUpState.level,
    levelTitle: levelUpState.levelTitle,
    dismissLevelUpModal: dismissModal,
  };
}
