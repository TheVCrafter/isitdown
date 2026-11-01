import type { CheckResult } from "./check-result.js";

export interface ResultStorage {
  save(result: CheckResult): Promise<void>;
  // Returns the results for one URL, newest first.
  getHistory(url: string): Promise<readonly CheckResult[]>;
}
