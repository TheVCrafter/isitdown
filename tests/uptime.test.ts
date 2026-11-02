import { describe, expect, it } from "vitest";
import type { CheckResult, CheckStatus } from "../src/check-result.js";
import { calculateUptime } from "../src/uptime.js";

const now = new Date("2026-11-02T12:00:00.000Z");
const hour = 60 * 60 * 1000;

function resultAt(status: CheckStatus, checkedAt: string): CheckResult {
  if (status === "up") {
    return {
      outcome: "responded",
      url: "https://example.com/",
      checkedAt,
      status,
      httpStatus: 200,
      responseTimeMS: 100,
    };
  }
  return {
    outcome: "failed",
    url: "https://example.com/",
    checkedAt,
    status,
    error: "down",
  };
}

describe("calculateUptime", () => {
  it("returns null for an empty list", () => {
    expect(calculateUptime([], now, hour)).toBeNull();
  });

  it("returns 100 when all results in the period are up", () => {
    const results = [
      resultAt("up", "2026-11-02T11:30:00.000Z"),
      resultAt("up", "2026-11-02T11:45:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(100);
  });

  it("returns 0 when all results in the period are down", () => {
    const results = [
      resultAt("down", "2026-11-02T11:30:00.000Z"),
      resultAt("down", "2026-11-02T11:45:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(0);
  });

  it("returns 50 when half of the results are up", () => {
    const results = [
      resultAt("up", "2026-11-02T11:30:00.000Z"),
      resultAt("down", "2026-11-02T11:45:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(50);
  });

  it("returns 66.7 when 2/3 of the results are up", () => {
    const results = [
      resultAt("up", "2026-11-02T11:30:00.000Z"),
      resultAt("up", "2026-11-02T11:45:00.000Z"),
      resultAt("down", "2026-11-02T11:45:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(66.7);
  });

  it("ignores results older than the period", () => {
    const results = [
      resultAt("down", "2026-11-02T10:30:00.000Z"),
      resultAt("up", "2026-11-02T11:30:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(100);
  });

  it("ignores results after the current time", () => {
    const results = [
      resultAt("down", "2026-11-02T12:30:00.000Z"),
      resultAt("up", "2026-11-02T11:30:00.000Z"),
    ];

    expect(calculateUptime(results, now, hour)).toBe(100);
  });

  it("counts a result that is exactly at the start of the period", () => {
    const results = [resultAt("up", "2026-11-02T11:00:00.000Z")];

    expect(calculateUptime(results, now, hour)).toBe(100);
  });

  it("counts failed results as down", () => {
    const results = [resultAt("down", "2026-11-02T11:30:00.000Z")];

    expect(calculateUptime(results, now, hour)).toBe(0);
  });

  it("returns null when no result exists in the period", () => {
    const results = [resultAt("up", "2026-11-02T10:30:00.000Z")];

    expect(calculateUptime(results, now, hour)).toBe(null);
  });
});
