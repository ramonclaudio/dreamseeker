import { useState, useRef, useCallback, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

type TimerStatus = "idle" | "running" | "paused" | "complete";

export function useFocusTimer(initialDuration = 25 * 60) {
  const [duration, setDurationState] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [status, setStatus] = useState<TimerStatus>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundTimestampRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setStatus("paused");
  }, [clearTimer]);

  const resume = useCallback(() => {
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(duration);
    setStatus("idle");
  }, [clearTimer, duration]);

  const setDuration = useCallback(
    (seconds: number) => {
      clearTimer();
      setDurationState(seconds);
      setRemaining(seconds);
      setStatus("idle");
    },
    [clearTimer]
  );

  // Tick interval
  useEffect(() => {
    if (status !== "running") return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [status, clearTimer]);

  // Handle timer completion
  useEffect(() => {
    if (remaining <= 0 && status === "running") {
      clearTimer();
      setStatus("complete");
    }
  }, [remaining, status, clearTimer]);

  // AppState handling
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (status !== "running") return;

      if (nextState === "background" || nextState === "inactive") {
        backgroundTimestampRef.current = Date.now();
        clearTimer();
      } else if (nextState === "active" && backgroundTimestampRef.current !== null) {
        const elapsed = Math.floor((Date.now() - backgroundTimestampRef.current) / 1000);
        backgroundTimestampRef.current = null;

        setRemaining((prev) => {
          const next = prev - elapsed;
          if (next <= 0) {
            return 0;
          }
          return next;
        });
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [status, clearTimer]);

  const progress = duration > 0 ? (duration - remaining) / duration : 0;

  return {
    duration,
    remaining,
    status,
    progress,
    start,
    pause,
    resume,
    reset,
    setDuration,
  } as const;
}
