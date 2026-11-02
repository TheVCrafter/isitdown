import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { checkUrl } from "../../src/check-url.js";
import { runChecks } from "../../src/scheduler.js";
import { createHistoryServer } from "../../src/server.js";
import { SqliteStorage } from "../../src/sqlite-storage.js";
import { startTargetServer, type TargetServer } from "../helpers/target-server.js";

describe("pipeline: check, store and report", () => {
  let target: TargetServer;
  let storage: SqliteStorage;
  let historyServer: Server;
  let historyUrl: string;

  async function fetchReport(path: string): Promise<unknown> {
    const monitored = `${target.baseUrl}${path}`;
    const response = await fetch(
      `${historyUrl}/api/history?url=${encodeURIComponent(monitored)}&period=1h`,
    );
    expect(response.status).toBe(200);
    return response.json();
  }

  beforeAll(async () => {
    target = await startTargetServer();
    storage = new SqliteStorage(":memory:");

    await runChecks({
      urls: ["/ok", "/error", "/redirect", "/slow"].map((path) => `${target.baseUrl}${path}`),
      intervalMs: 1000,
      storage,
      check: (url) => checkUrl(url, { timeoutMs: 300 }),
    });

    historyServer = createHistoryServer(storage);
    await new Promise<void>((resolve) => historyServer.listen(0, "127.0.0.1", resolve));

    const address = historyServer.address();
    if (address === null || typeof address === "string") {
      throw new Error("The history server did not start on a TCP port");
    }
    historyUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      historyServer.closeAllConnections();
      historyServer.close((error) => (error ? reject(error) : resolve()));
    });
    await target.close();
    storage.close();
  });

  it("reports a working page as up with 100 percent uptime", async () => {
    expect(await fetchReport("/ok")).toMatchObject({
      uptimePercent: 100,
      results: [{ outcome: "responded", status: "up", httpStatus: 200 }],
    });
  });

  it("reports a server error as down with 0 percent uptime", async () => {
    expect(await fetchReport("/error")).toMatchObject({
      uptimePercent: 0,
      results: [{ outcome: "responded", status: "down", httpStatus: 500 }],
    });
  });

  it("follows a redirect and reports the final page as up", async () => {
    expect(await fetchReport("/redirect")).toMatchObject({
      uptimePercent: 100,
      results: [{ outcome: "responded", status: "up", httpStatus: 200 }],
    });
  });

  it("reports a page that never answers as failed and down", async () => {
    expect(await fetchReport("/slow")).toMatchObject({
      uptimePercent: 0,
      results: [{ outcome: "failed", status: "down", error: expect.any(String) }],
    });
  });
});
