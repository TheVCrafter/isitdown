import { statusFromHttpCode, type CheckResult } from "./check-result.js";

export type CheckOptions = {
  readonly timeoutMs?: number;
  readonly fetchFn?: typeof fetch;
  readonly now?: () => Date;
};

export async function checkUrl(url: string, options: CheckOptions = {}): Promise<CheckResult> {
  const { timeoutMs = 10_000, fetchFn = fetch, now = () => new Date() } = options;
  const start: number = performance.now();
  const timestamp: string = now().toISOString();
  try {
    const response = await fetchFn(url, { signal: AbortSignal.timeout(timeoutMs) });
    const responseTimeMS = Math.round(performance.now() - start);
    const status = statusFromHttpCode(response.status);
    return {
      outcome: "responded",
      url,
      checkedAt: timestamp,
      status,
      httpStatus: response.status,
      responseTimeMS,
    };
  } catch (error) {
    const narrowed = error instanceof Error ? error.message : String(error);
    return { outcome: "failed", url, checkedAt: timestamp, status: "down", error: narrowed };
  }
}
