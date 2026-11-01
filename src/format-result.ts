import type { CheckResult } from "./check-result.js";

export function formatResult(result: CheckResult): string {
  if (result.outcome === "responded") {
    return `${result.status.toUpperCase().padEnd(4)}   ${result.url}   HTTP ${result.httpStatus}    ${result.responseTimeMS} ms    ${result.checkedAt}`;
  }
  return `${result.status.toUpperCase().padEnd(4)}   ${result.url}   ${result.error}    ${result.checkedAt}`;
}
