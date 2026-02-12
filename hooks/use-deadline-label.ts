import { useState, useEffect } from "react";
import { formatDeadline, getNextTickMs } from "@/lib/deadline";

/**
 * Returns a live-updating deadline label that re-renders at the optimal
 * frequency: every minute when close, every 30 min for hours, every hour
 * for days. Fires exactly at the deadline boundary so the transition from
 * "Due in Xm" → "Overdue" is instant.
 */
export function useDeadlineLabel(deadlineMs: number | undefined) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (deadlineMs === undefined) return;

    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      const ms = getNextTickMs(deadlineMs!);
      timer = setTimeout(() => {
        tick((t) => t + 1);
        schedule(); // re-schedule with fresh interval
      }, ms);
    }

    schedule();
    return () => clearTimeout(timer);
  }, [deadlineMs]);

  return formatDeadline(deadlineMs);
}
