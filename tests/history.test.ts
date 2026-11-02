import { describe, expect, it } from "vitest";
import type { CheckResult, CheckStatus } from "../src/check-result.js";
import { buildHistoryReport } from "../src/history.js";
import type { ResultStorage } from "../src/storage.js";

const now = new Date("2026-11-02T12:00:00.000Z");
const hour = 60 * 60 * 1000;
const url = "https://example.com/";

class MemoryStorage implements ResultStorage {
  readonly saved: CheckResult[] = [];

  async save(result: CheckResult): Promise<void> {
    this.saved.push(result);
  }

  async getHistory(requestedUrl: string): Promise<readonly CheckResult[]> {
    return this.saved.filter((result) => result.url === requestedUrl).reverse();
  }
}

function resultAt(status: CheckStatus, checkedAt: string, resultUrl = url): CheckResult {
  if (status === "up") {
    return {
      outcome: "responded",
      url: resultUrl,
      checkedAt,
      status,
      httpStatus: 200,
      responseTimeMS: 100,
    };
  }

  return {
    outcome: "failed",
    url: resultUrl,
    checkedAt,
    status,
    error: "down",
  };
}

describe("buildHistoryReport", () => {
  it("returns the results of the requested URL only", async () => {
    const storage = new MemoryStorage();
    await storage.save(resultAt("up", "2026-11-02T11:30:00.000Z"));
    await storage.save(resultAt("up", "2026-11-02T11:40:00.000Z", "https://other.example/"));

    const report = await buildHistoryReport(storage, url, hour, now);

    expect(report.results.map((result) => result.url)).toEqual([url]);
  });

  it("returns only the results inside the period, newest first", async () => {
    const storage = new MemoryStorage();
    await storage.save(resultAt("up", "2026-11-02T10:30:00.000Z"));
    await storage.save(resultAt("up", "2026-11-02T11:20:00.000Z"));
    await storage.save(resultAt("up", "2026-11-02T11:40:00.000Z"));

    const report = await buildHistoryReport(storage, url, hour, now);

    expect(report.results.map((result) => result.checkedAt)).toEqual([
      "2026-11-02T11:40:00.000Z",
      "2026-11-02T11:20:00.000Z",
    ]);
  });

  it("calculates the uptime from the results in the list", async () => {
    const storage = new MemoryStorage();
    await storage.save(resultAt("up", "2026-11-02T11:20:00.000Z"));
    await storage.save(resultAt("down", "2026-11-02T11:40:00.000Z"));

    const report = await buildHistoryReport(storage, url, hour, now);

    expect(report.uptimePercent).toBe(50);
  });

  it("returns an empty list and no uptime for a URL without results", async () => {
    const storage = new MemoryStorage();

    const report = await buildHistoryReport(storage, url, hour, now);

    expect(report.results).toEqual([]);
    expect(report.uptimePercent).toBeNull();
  });

  it("contains the URL and the period it was built for", async () => {
    const storage = new MemoryStorage();

    const report = await buildHistoryReport(storage, url, hour, now);

    expect(report.url).toBe(url);
    expect(report.periodMs).toBe(hour);
  });
});
