import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckResult, CheckStatus } from "../src/check-result.js";
import { createHistoryServer } from "../src/server.js";
import type { ResultStorage } from "../src/storage.js";

const now = new Date("2026-11-02T12:00:00.000Z");
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

function resultAt(status: CheckStatus, checkedAt: string): CheckResult {
  if (status === "up") {
    return {
      outcome: "responded",
      url,
      checkedAt,
      status,
      httpStatus: 200,
      responseTimeMS: 100,
    };
  }

  return {
    outcome: "failed",
    url,
    checkedAt,
    status,
    error: "down",
  };
}

describe("history server", () => {
  let storage: MemoryStorage;
  let server: Server;
  let baseUrl: string;

  function historyUrl(params: Record<string, string>): string {
    return `${baseUrl}/api/history?${new URLSearchParams(params).toString()}`;
  }

  beforeEach(async () => {
    storage = new MemoryStorage();
    server = createHistoryServer(storage, () => now);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("The server did not start on a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns the report for a stored URL", async () => {
    await storage.save(resultAt("up", "2026-11-02T11:30:00.000Z"));

    const response = await fetch(historyUrl({ url, period: "1h" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      url,
      periodMs: 3600000,
      uptimePercent: 100,
    });
  });

  it("answers the health check", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("uses the default period when no period is given", async () => {
    await storage.save(resultAt("up", "2026-11-02T11:30:00.000Z"));

    const response = await fetch(historyUrl({ url }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      url,
      periodMs: 86400000,
      uptimePercent: 100,
    });
  });

  it("finds the stored results when the url has no trailing slash", async () => {
    const stored = resultAt("up", "2026-11-02T11:30:00.000Z");
    await storage.save(stored);

    const response = await fetch(historyUrl({ url: "https://example.com" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      url,
      uptimePercent: 100,
      results: [stored],
    });
  });

  it("answers 400 when the url is missing", async () => {
    const response = await fetch(`${baseUrl}/api/history`);

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });

  it("answers 400 when the url is invalid", async () => {
    const response = await fetch(historyUrl({ url: "not-a-url" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });

  it("answers 400 when the period is unknown", async () => {
    const response = await fetch(historyUrl({ url, period: "abc" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });

  it("answers 404 for another path", async () => {
    const response = await fetch(`${baseUrl}/other`);

    expect(response.status).toBe(404);
  });

  it("answers 405 for a request that is not GET", async () => {
    const response = await fetch(historyUrl({ url }), { method: "POST" });

    expect(response.status).toBe(405);
  });

  it("answers 500 without leaking the error message when the storage fails", async () => {
    vi.spyOn(storage, "getHistory").mockRejectedValue(new Error("disk full"));

    const response = await fetch(historyUrl({ url }));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("Internal server error");
    expect(body).not.toContain("disk full");
  });

  it("serves the history page at the root path", async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(await response.text()).toContain("IsItDown?");
  });
});
