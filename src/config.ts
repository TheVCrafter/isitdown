export const DEFAULT_INTERVAL_SECONDS = 300; // 5 minutes

export function readIntervalMs(value: string | undefined): number {
  if (typeof value === "undefined") {
    return DEFAULT_INTERVAL_SECONDS * 1000;
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return DEFAULT_INTERVAL_SECONDS * 1000;
  }
  const interval = Number(trimmed);
  if (interval > 0 && Number.isInteger(interval)) {
    return interval * 1000;
  }

  throw new Error(`The check interval must be a whole number of seconds above 0, got "${value}"`);
}
