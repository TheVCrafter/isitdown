import type { CheckResult } from "./check-result.js";
import type { ResultStorage } from "./storage.js";

export type SchedulerOptions = {
  readonly urls: readonly string[];
  readonly intervalMs: number;
  readonly storage: ResultStorage;
  readonly check: (url: string) => Promise<CheckResult>;
  readonly onError?: (error: unknown) => void;
};

// Checks every URL once and saves each result.
export async function runChecks(options: SchedulerOptions): Promise<void> {
  for (const url of options.urls) {
    try {
      const result = await options.check(url);
      await options.storage.save(result);
    } catch (error: unknown) {
      reportError(options, error);
    }
  }
}

export function startScheduler(options: SchedulerOptions): () => void {
  let running = false;

  async function runRound(): Promise<void> {
    if (running) {
      return;
    }
    running = true;
    try {
      await runChecks(options);
    } catch (error: unknown) {
      reportError(options, error);
    } finally {
      running = false;
    }
  }

  void runRound();
  const timer = setInterval(() => void runRound(), options.intervalMs);
  return () => clearInterval(timer);
}

function reportError(options: SchedulerOptions, error: unknown): void {
  if (options.onError) {
    options.onError(error);
    return;
  }
  console.error(error instanceof Error ? error.message : String(error));
}
