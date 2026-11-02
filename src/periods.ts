export const PERIODS = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
} as const;

export const DEFAULT_PERIOD = "24h";

// Returns the period in milliseconds for a period name such as "24h".
// A missing value (null) gives the default period; an unknown name gives null.
export function parsePeriod(value: string | null): number | null {
  if (value === null) {
    return PERIODS[DEFAULT_PERIOD];
  }
  if (isPeriodName(value)) {
    return PERIODS[value];
  }
  return null;
}

function isPeriodName(value: string): value is keyof typeof PERIODS {
  return Object.hasOwn(PERIODS, value);
}
