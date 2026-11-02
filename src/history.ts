import type { CheckResult } from "./check-result.js";
import type { ResultStorage } from "./storage.js";
import { calculateUptime, resultsInPeriod } from "./uptime.js";

export type HistoryReport = {
  readonly url: string;
  readonly periodMs: number;
  readonly uptimePercent: number | null;
  readonly results: readonly CheckResult[];
};

export async function buildHistoryReport(
  storage: ResultStorage,
  url: string,
  periodMs: number,
  now: Date,
): Promise<HistoryReport> {
  const history = await storage.getHistory(url);
  const results = resultsInPeriod(history, now, periodMs);
  const uptimePercent = calculateUptime(results, now, periodMs);
  return {
    url,
    periodMs,
    uptimePercent,
    results,
  };
}
