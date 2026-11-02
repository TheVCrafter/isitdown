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

export const DEFAULT_PORT = 3000;

export function readPort(value: string | undefined): number {
  if (typeof value === "undefined" || value.trim() === "") {
    return DEFAULT_PORT;
  }
  const port = Number(value);
  if (Number.isInteger(port) && port >= 1 && port <= 65535) {
    return port;
  }

  throw new Error(`The port must be a whole number from 1 to 65535, got "${value}"`);
}
