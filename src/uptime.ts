import type { CheckResult } from "./check-result.js";

// Returns the share of "up" results within the last periodMs milliseconds,
// as a percentage from 0 to 100, or null when there are no results in that period.
export function calculateUptime(
  results: readonly CheckResult[],
  now: Date,
  periodMs: number,
): number | null {
  const end = now.getTime();
  const start = end - periodMs;

  const inPeriod = results.filter((result) => {
    const time = new Date(result.checkedAt).getTime();
    return time >= start && time <= end;
  });

  if (inPeriod.length === 0) {
    return null;
  }

  const upCount = inPeriod.filter((result) => result.status === "up").length;

  return Math.round((upCount / inPeriod.length) * 1000) / 10;
}
